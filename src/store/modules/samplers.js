import Vue from "vue";
import * as Tone from "tone";
import Instruments from "@/utils/instruments";
import { Midi } from "@tonaljs/tonal";
import {
	playerType, instrumentType, eventSourceType,
    messageType, statusType, noteType,
    uiParameterType, workerParameterType,
    workerHookType,
    instNamesTemp
    } from '@/utils/types.js'

// window.onclick = () => {
//     Tone.start();
//     // Tone.context.lookAhead = 0;
// };

const state = {
    metronomeMuteStatus: true,
    humanMuteStatus: false,
    workerMuteStatus: false,
    humanSamplersVolume: 0, // in dB
    workerSamplersVolume: 0, // in dB
    metronomeSamplerVolume: 0, // in dB

    instrumentsConfig: null,
    // metronome
    metronomeSampler: null,
    metronomeBus: null,
    // human
    humanBus: null,
    humanSamplersBus: null,
    humanSamplers: null,
    // worker
    workerBus: null,
    workerSamplersBus: null,
    workerSamplers: null,
    // limiter
    limiter: null,
};

const getters = {
    getmetronomeMuteStatus(state){
        return state.metronomeMuteStatus;
    },
    getUserSamplersVolume(state){
        return state.humanSamplersVolume;
    },
    getWorkerSamplersVolume(state){
        return state.workerSamplersVolume;
    },
    getMetronomeSamplerVolume(state){
        return state.metronomeSamplerVolume;
    },
};

const actions = {
    // createInstruments(context){
    //     console.log("Inside createInstruments config is ", context.state.instrumentsConfig);
    // },
    samplerOn(context, noteEvent){
        let instrument_label = instNamesTemp[noteEvent.instrument];
        if (noteEvent.player == playerType.HUMAN){
            
            let instrument_to_play_on = context.state.humanSamplers[instrument_label];
            if (instrument_to_play_on == null){
                throw new Error("Instrument " + instrument_label + " not found in humanSamplers");
            } else {
                instrument_to_play_on.triggerAttack(noteEvent.name, Tone.now() + noteEvent.playAfter.seconds, noteEvent.velocity / 127);
            }
        } else if (noteEvent.player == playerType.WORKER){
            // if noteEvent.name is null then use tonal.js to get the name of the note from noteEvent.midi
            let name = noteEvent.name;
            if (name == null){
                name = Midi.midiToNoteName(noteEvent.midi, { sharps: true });
            }
            // console.log("WorkerSAMPLER", noteEvent.midi, Tone.now() + noteEvent.playAfter.seconds)
            let instrument_to_play_on = context.state.workerSamplers[instrument_label];
            if (instrument_to_play_on == null){
                throw new Error("Instrument " + instrument_label + " not found in workerSamplers");
            } else {
                instrument_to_play_on.triggerAttack(name, Tone.now() + noteEvent.playAfter.seconds, noteEvent.velocity / 127);
            }
        } else if (noteEvent.player == playerType.METRONOME){
            // console.log("metronome", noteEvent)
            context.state.metronomeSampler.triggerAttack(noteEvent.name, Tone.now() + noteEvent.playAfter.seconds);
            // release the note 0.5s after the attack
            // TODO : make that depend on the beat duration
            context.state.metronomeSampler.triggerRelease(noteEvent.name, Tone.now() + noteEvent.playAfter.seconds + 500);
        }
    },
    samplerOff(context, noteEvent){
        let instrument_label = instNamesTemp[noteEvent.instrument];
        if (noteEvent.player == playerType.HUMAN){
            let instrument_to_play_on = context.state.humanSamplers[instrument_label];
            if (instrument_to_play_on == null){
                throw new Error("Instrument " + instrument_label + " not found in humanSamplers");
            } else {
                instrument_to_play_on.triggerRelease(noteEvent.name, Tone.now() + noteEvent.playAfter.seconds);
            }

        } else if (noteEvent.player == playerType.WORKER){
            let name = noteEvent.name;
            if (name == null){
                name = Midi.midiToNoteName(noteEvent.midi, { sharps: true });   
            }
            let instrument_to_play_on = context.state.workerSamplers[instrument_label];
            if (instrument_to_play_on == null){
                throw new Error("Instrument " + instrument_label + " not found in workerSamplers");
            } else {
                instrument_to_play_on.triggerRelease(name, Tone.now() + noteEvent.playAfter.seconds);
            }
        }
    },
};

const mutations = {
    // muteMetronome(state){
    //     metronomeBus.mute = state.metronomeMuteStatus;
    // },
    flipMetronomeSamplerMuteStatus(state){
        state.metronomeMuteStatus = !state.metronomeMuteStatus;
        if (state.metronomeMuteStatus){
            metronomeBus.mute = true;
        } else {
            metronomeBus.mute = false;
        }
    },

    flipHumanSamplersMuteStatus(state){
        state.humanMuteStatus = !state.humanMuteStatus;
        if (state.humanMuteStatus){
            humanBus.mute = true;
        } else {
            humanBus.mute = false;
        }
    },
    flipWorkerSamplersMuteStatus(state){
        state.workerMuteStatus = !state.workerMuteStatus;
        if (state.workerMuteStatus){
            workerBus.mute = true;
        } else {
            workerBus.mute = false;
        }
    },

    muteHumanSampler(state, instrument){
        humanSamplersBus[instrument].mute = true;
    },
    unmuteHumanSampler(state, instrument){
        humanSamplersBus[instrument].mute = false;
    },
    muteWorkerSampler(state, instrument){
        workerSamplersBus[instrument].mute = true;
    },
    unmuteWorkerSampler(state, instrument){
        workerSamplersBus[instrument].mute = false;
    },
    
    createInstruments(state, config){
        state.instrumentsConfig = config.instruments;
        console.log("inside setInstrumentsConfig", state.instrumentsConfig);
        state.limiter = new Tone.Limiter(-5).toDestination();
        // const tremolo = new Tone.Tremolo(9, 0.75).toDestination().start();
        
        state.humanBus = new Tone.Channel().connect(state.limiter);
        state.humanSamplersBus = {
            synth: new Tone.Channel().connect(state.humanBus),
            piano: new Tone.Channel().connect(state.humanBus),
            drums: new Tone.Channel().connect(state.humanBus),
            upright_bass: new Tone.Channel().connect(state.humanBus),
        }
        
        state.humanSamplers = {
            synth: new Tone.PolySynth(Tone.FMSynth).connect(state.humanSamplersBus["synth"]),
            piano: new Instruments().createSampler("piano", (piano) => {
                piano.connect(state.humanSamplersBus["piano"]);
            }),
            drums: new Instruments().createSampler("drums", (drums) => {
                drums.connect(state.humanSamplersBus["drums"]);
            }),
            upright_bass: new Instruments().createSampler("upright_bass", (upright_bass) => {
                upright_bass.connect(state.humanSamplersBus["upright_bass"]);
            }),
        }
        
        state.workerBus = new Tone.Channel().connect(state.limiter);
        
        state.workerSamplersBus = {
            synth: new Tone.Channel().connect(state.workerBus),
            piano: new Tone.Channel().connect(state.workerBus),
            drums: new Tone.Channel().connect(state.workerBus),
            upright_bass: new Tone.Channel().connect(state.workerBus),
        }
        
        state.workerSamplers = {
            synth: new Tone.PolySynth(Tone.FMSynth).connect(state.workerSamplersBus["synth"]),
            piano: new Instruments().createSampler("piano", (piano) => {
                piano.connect(state.workerSamplersBus["piano"]);
            }),
            drums: new Instruments().createSampler("drums", (drums) => {
                drums.connect(state.workerSamplersBus["drums"]);
            }),
            upright_bass: new Instruments().createSampler("upright_bass", (upright_bass) => {
                upright_bass.connect(state.workerSamplersBus["upright_bass"]);
            }),
        }
        
        state.metronomeSampler = new Instruments().createSampler(
            "metronome",
            (metronome) => {
                metronome.release = 0.2;
            }
        );
        
        state.metronomeBus = new Tone.Channel().connect(state.limiter);
        state.metronomeBus.mute = true;
        state.metronomeSampler.connect(state.metronomeBus);
        console.log(state.humanSamplers);

    },

    setHumanVolume(state, volume){
        console.log("inside set Human Volum ", volume)
        if (volume == 10){
            state.humanSamplerVolume = 0;
        } else{
            var toDB = -Math.abs(20*Math.log(volume/10));
            state.humanSamplerVolume = toDB;
        }
        state.humanBus.volume.value = state.humanSamplerVolume;
    },
    setHumanSamplerVolume(state, payload){
        let instrument = payload.instrument;
        let volume = payload.volume;
        if (volume == 10){
            state.humanSamplersBus[instrument].volume.value = 0;
        } else {
            var toDB = -Math.abs(20*Math.log(volume/10));
            state.humanSamplersBus[instrument].volume.value = toDB;
        }
    },
    setWorkerVolume(state, volume){
        if (volume == 10){
            state.workerSamplerVolume = 0;
        } else {
            var toDB = -Math.abs(20*Math.log(volume/10));
            state.workerSamplerVolume = toDB;
        };
        state.workerBus.volume.value = state.workerSamplerVolume;
    },
    setWorkerSamplerVolume(state, payload){
        let instrument = payload.instrument;
        let volume = payload.volume;
        if (volume == 10){
            state.workerSamplersBus[instrument].volume.value = 0;
        } else {
            var toDB = -Math.abs(20*Math.log(volume/10));
            state.workerSamplersBus[instrument].volume.value = toDB;
        }
    },
    setMetronomeVolume(state, volume){
        if (volume == 10){
            state.metronomeSamplerVolume = 0;
        } else {
            var toDB = -Math.abs(20*Math.log(volume/10));
            state.metronomeSamplerVolume = toDB;
        };
        state.metronomeSampler.volume.value = state.metronomeSamplerVolume;
    }
};

export default {
    state,
    getters,
    actions,
    mutations,
};
