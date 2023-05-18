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

const humanSampler = new Tone.PolySynth(Tone.FMSynth).connect(limiter);
// create a polysynth sampler with 8 voice polyphony
// const humanSampler = new Tone.PolySynth()


// new Instruments().createSampler("piano", (piano) => {
//     piano.toDestination();
// });

const workerSampler = new Tone.PolySynth(Tone.FMSynth).connect(limiter);


// const workerSampler = new Instruments().createSampler("piano", (piano) => {
//     piano.toDestination();
// });

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
    humanSamplerGain: 0, // in dB
    workerSamplerGain: 0, // in dB
    metronomeSamplerGain: 0, // in dB
};

const getters = {
    getMetronomeStatus(state){
        return state.metronomeStatus;
    },
    getUserSamplerGain(state){
        return state.humanSamplerGain;
    },
    getWorkerSamplerGain(state){
        return state.workerSamplerGain;
    },
    getMetronomeSamplerGain(state){
        return state.metronomeSamplerGain;
    },
};

const actions = {
    samplerOn(state, noteEvent){
        // console.log("samplerOn", noteEvent)
        // {samplerName, currentNote, time}
        if (noteEvent.player == "human"){
            humanSampler.triggerAttack(noteEvent.name, Tone.now() + noteEvent.playAfter.seconds, noteEvent.velocity / 127);
            // console.log("NAME TO SAMPLER ON IS ", noteEvent.midi, Tone.now() + noteEvent.playAfter.seconds)

        } else if (noteEvent.player == "worker"){
            // if noteEvent.name is null then use tonal.js to get the name of the note from noteEvent.midi
            let name = noteEvent.name;
            if (name == null){
                name = Midi.midiToNoteName(noteEvent.midi, { sharps: true });
                
            }
            // console.log("WorkerSAMPLER", noteEvent.midi, Tone.now() + noteEvent.playAfter.seconds)
            workerSampler.triggerAttack(name, Tone.now() + noteEvent.playAfter.seconds, noteEvent.velocity / 127);
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
            humanSampler.triggerRelease(noteEvent.name, Tone.now() + noteEvent.playAfter.seconds);
            // console.log("NAME TO SAMPLER OFF IS ", noteEvent.midi, Tone.now() + noteEvent.playAfter.seconds)

        } else if (noteEvent.player == "worker"){
            let name = noteEvent.name;
            if (name == null){
                name = Midi.midiToNoteName(noteEvent.midi, { sharps: true });   
            }
            // use setTimeout to release the note after the playAfter.seconds
            // setTimeout(() => {
            //     workerSampler.triggerRelease(name, Tone.now());
            //     console.log("NAME TO SAMPLER OFF IS ", noteEvent.midi, Tone.now())
            // }, noteEvent.playAfter.seconds * 1000);

            // console.log("Worker SAMPLER OFF IS ", noteEvent.midi, Tone.now() + noteEvent.playAfter.seconds)
            workerSampler.triggerRelease(name, Tone.now() + noteEvent.playAfter.seconds);
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
    // TODO : use the same function for both samplers
    setHumanVolume(state, volume){
        if (volume == 10){
            state.humanSamplerGain = 0;
        } else{
            var toDB = -Math.abs(20*Math.log(volume/10));
            state.humanSamplerGain = toDB;
        }
        humanSampler.volume.value = state.humanSamplerGain;
    },
    setWorkerVolume(state, volume){
        if (volume == 10){
            state.workerSamplerGain = 0;
        } else {
            var toDB = -Math.abs(20*Math.log(volume/10));
            state.workerSamplerGain = toDB;
        };
        workerSampler.volume.value = state.workerSamplerGain;
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
