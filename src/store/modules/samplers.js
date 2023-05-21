import Vue from "vue";
import * as Tone from "tone";
import Instruments from "@/library/instruments";
import { Midi } from "@tonaljs/tonal";

window.onclick = () => {
    Tone.start();
    Tone.context.lookAhead = 0;
};

const limiter = new Tone.Limiter(-5).toDestination();
// const tremolo = new Tone.Tremolo(9, 0.75).toDestination().start();

const humanSamplerBus = new Tone.Channel().connect(limiter);

const humanSamplers = {
    synth: new Tone.PolySynth(Tone.FMSynth).connect(humanSamplerBus),
    piano: new Instruments().createSampler("piano", (piano) => {
        piano.connect(humanSamplerBus);
    }),
    drums: new Instruments().createSampler("drums", (drums) => {
        drums.connect(humanSamplerBus);
    }),
    upright_bass: new Instruments().createSampler("upright_bass", (upright_bass) => {
        upright_bass.connect(humanSamplerBus);
    }),
}

const workerSamplerBus = new Tone.Channel().connect(limiter);

const workerSamplers = {
    synth: new Tone.PolySynth(Tone.FMSynth).connect(workerSamplerBus),
    piano: new Instruments().createSampler("piano", (piano) => {
        piano.connect(workerSamplerBus);
    }),
    drums: new Instruments().createSampler("drums", (drums) => {
        drums.connect(workerSamplerBus);
    }),
    upright_bass: new Instruments().createSampler("upright_bass", (upright_bass) => {
        upright_bass.connect(workerSamplerBus);
    }),
}

const metronomeSampler = new Instruments().createSampler(
    "metronome",
    (metronome) => {
        metronome.release = 0.2;
    }
);

const metronomeBus = new Tone.Channel().connect(limiter);
metronomeBus.mute = true;

metronomeSampler.connect(metronomeBus);

const state = {
    metronomeMuteStatus: true,
    humanMuteStatus: false,
    workerMuteStatus: false,
    humanSamplersVolume: 0, // in dB
    workerSamplersVolume: 0, // in dB
    metronomeSamplerVolume: 0, // in dB
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
    samplerOn(state, noteEvent){
        if (noteEvent.player == "human"){
            let instrument_to_play_on = humanSamplers[noteEvent.instrument];
            if (instrument_to_play_on == null){
                throw new Error("Instrument " + noteEvent.instrument + " not found in humanSamplers");
            } else {
                instrument_to_play_on.triggerAttack(noteEvent.name, Tone.now() + noteEvent.playAfter.seconds, noteEvent.velocity / 127);
            }
        } else if (noteEvent.player == "worker"){
            // if noteEvent.name is null then use tonal.js to get the name of the note from noteEvent.midi
            let name = noteEvent.name;
            if (name == null){
                name = Midi.midiToNoteName(noteEvent.midi, { sharps: true });
            }
            // console.log("WorkerSAMPLER", noteEvent.midi, Tone.now() + noteEvent.playAfter.seconds)
            let instrument_to_play_on = workerSamplers[noteEvent.instrument];
            if (instrument_to_play_on == null){
                throw new Error("Instrument " + noteEvent.instrument + " not found in workerSamplers");
            } else {
                instrument_to_play_on.triggerAttack(name, Tone.now() + noteEvent.playAfter.seconds, noteEvent.velocity / 127);
            }
        } else if (noteEvent.player == "metronome"){
            // console.log("metronome", noteEvent)
            metronomeSampler.triggerAttack(noteEvent.name, Tone.now() + noteEvent.playAfter.seconds);
            // release the note 0.5s after the attack
            // TODO : make that depend on the beat duration
            metronomeSampler.triggerRelease(noteEvent.name, Tone.now() + noteEvent.playAfter.seconds + 500);
        }
    },
    samplerOff(state, noteEvent){
        if (noteEvent.player == "human"){
            let instrument_to_play_on = humanSamplers[noteEvent.instrument];
            if (instrument_to_play_on == null){
                throw new Error("Instrument " + noteEvent.instrument + " not found in humanSamplers");
            } else {
                instrument_to_play_on.triggerRelease(noteEvent.name, Tone.now() + noteEvent.playAfter.seconds);
            }

        } else if (noteEvent.player == "worker"){
            let name = noteEvent.name;
            if (name == null){
                name = Midi.midiToNoteName(noteEvent.midi, { sharps: true });   
            }
            let instrument_to_play_on = workerSamplers[noteEvent.instrument];
            if (instrument_to_play_on == null){
                throw new Error("Instrument " + noteEvent.instrument + " not found in workerSamplers");
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
            humanSamplerBus.mute = true;
        } else {
            humanSamplerBus.mute = false;
        }
    },
    flipWorkerSamplersMuteStatus(state){
        state.workerMuteStatus = !state.workerMuteStatus;
        if (state.workerMuteStatus){
            workerSamplerBus.mute = true;
        } else {
            workerSamplerBus.mute = false;
        }
    },

    // muteHumanSampler(state, instrument){
    //     humanSamplers[instrument].mute = true;
    // },
    // unmuteHumanSampler(state, instrument){
    //     humanSamplers[instrument].mute = false;
    // },
    // muteWorkerSampler(state, instrument){
    //     workerSamplers[instrument].mute = true;
    // },
    // unmuteWorkerSampler(state, instrument){
    //     workerSamplers[instrument].mute = false;
    // },
    
    setHumanVolume(state, volume){
        if (volume == 10){
            state.humanSamplerVolume = 0;
        } else{
            var toDB = -Math.abs(20*Math.log(volume/10));
            state.humanSamplerVolume = toDB;
        }
        humanSamplerBus.volume.value = state.humanSamplerVolume;
    },
    setWorkerVolume(state, volume){
        if (volume == 10){
            state.workerSamplerVolume = 0;
        } else {
            var toDB = -Math.abs(20*Math.log(volume/10));
            state.workerSamplerVolume = toDB;
        };
        workerSamplerBus.volume.value = state.workerSamplerVolume;
    },
    setMetronomeVolume(state, volume){
        if (volume == 10){
            state.metronomeSamplerVolume = 0;
        } else {
            var toDB = -Math.abs(20*Math.log(volume/10));
            state.metronomeSamplerVolume = toDB;
        };
        metronomeSampler.volume.value = state.metronomeSamplerVolume;
    }
};

export default {
    state,
    getters,
    actions,
    mutations,
};
