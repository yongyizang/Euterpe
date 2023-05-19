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
    metronomeStatus: false,
    humanSamplersGain: 0, // in dB
    workerSamplersGain: 0, // in dB
    metronomeSamplerGain: 0, // in dB
};

const getters = {
    getMetronomeStatus(state){
        return state.metronomeStatus;
    },
    getUserSamplersGain(state){
        return state.humanSamplersGain;
    },
    getWorkerSamplersGain(state){
        return state.workerSamplersGain;
    },
    getMetronomeSamplerGain(state){
        return state.metronomeSamplerGain;
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
    muteMetronome(state){
        metronomeBus.mute = state.metronomeStatus;
    },
    flipMetronomeStatus(state){
        state.metronomeStatus = !state.metronomeStatus;
        if (state.metronomeStatus){
            metronomeBus.mute = false;
        } else {
            metronomeBus.mute = true;
        }
    },
    muteHumanSampler(state, instrument){
        humanSamplers[instrument].mute = true;
    },
    unmuteHumanSampler(state, instrument){
        humanSamplers[instrument].mute = false;
    },
    muteWorkerSampler(state, instrument){
        workerSamplers[instrument].mute = true;
    },
    unmuteWorkerSampler(state, instrument){
        workerSamplers[instrument].mute = false;
    },
    // TODO : use the same function for both samplers
    setHumanVolume(state, volume){
        if (volume == 10){
            state.humanSamplerGain = 0;
        } else{
            var toDB = -Math.abs(20*Math.log(volume/10));
            state.humanSamplerGain = toDB;
        }
        humanSamplerBus.volume.value = state.humanSamplerGain;
    },
    setWorkerVolume(state, volume){
        if (volume == 10){
            state.workerSamplerGain = 0;
        } else {
            var toDB = -Math.abs(20*Math.log(volume/10));
            state.workerSamplerGain = toDB;
        };
        workerSamplerBus.volume.value = state.workerSamplerGain;
    },
    setMetronomeVolume(state, volume){
        if (volume == 10){
            state.metronomeSamplerGain = 0;
        } else {
            var toDB = -Math.abs(20*Math.log(volume/10));
            state.metronomeSamplerGain = toDB;
        };
        metronomeSampler.volume.value = state.metronomeSamplerGain;
    }
};

export default {
    state,
    getters,
    actions,
    mutations,
};
