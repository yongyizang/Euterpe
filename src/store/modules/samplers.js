import Vue from "vue";
import * as Tone from "tone";
import Instruments from "@/library/instruments";
import { Midi } from "@tonaljs/tonal";

window.onclick = () => {
    Tone.start();
    Tone.context.lookAhead = 0;
};

const humanSampler = new Instruments().createSampler("piano", (piano) => {
    piano.toDestination();
});

const workerSampler = new Instruments().createSampler("piano", (piano) => {
    piano.toDestination();
});

const metronomeSampler = new Instruments().createSampler(
    "metronome",
    (metronome) => {
        metronome.release = 0.2;
    }
);

const metronomeBus = new Tone.Channel().toDestination();

metronomeSampler.connect(metronomeBus);

const state = {
    metronomeStatus: true,
    humanSamplerGain: 0, // in dB
    workerSamplerGain: 0, // in dB
};

const getters = {
    getMetronomeStatus(state){
        return state.metronomeStatus;
    },
    getUserSamplerGain(state){
        return state.humanSamplerGain;
    },
    getworkerSamplerGain(state){
        return state.workerSamplerGain;
    }
};

const actions = {
    samplerOn(state, noteEvent){
        // console.log("samplerOn", noteEvent)
        // {samplerName, currentNote, time}
        if (noteEvent.player == "human"){
            humanSampler.triggerAttack(noteEvent.name, Tone.now() + noteEvent.playAfter.seconds, noteEvent.velocity / 127);
            console.log("NAME TO SAMPLER ON IS ", noteEvent.midi, Tone.now() + noteEvent.playAfter.seconds)

        } else if (noteEvent.player == "worker"){
            // if noteEvent.name is null then use tonal.js to get the name of the note from noteEvent.midi
            let name = noteEvent.name;
            if (name == null){
                name = Midi.midiToNoteName(noteEvent.midi, { sharps: true });
                
            }
            console.log("NAME TO SAMPLER ON IS ", noteEvent.midi, Tone.now() + noteEvent.playAfter.seconds)
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
            console.log("NAME TO SAMPLER OFF IS ", noteEvent.midi, Tone.now() + noteEvent.playAfter.seconds)

        } else if (noteEvent.player == "worker"){
            let name = noteEvent.name;
            if (name == null){
                name = Midi.midiToNoteName(noteEvent.midi, { sharps: true });   
            }
            console.log("NAME TO SAMPLER OFF IS ", noteEvent.midi, Tone.now() + noteEvent.playAfter.seconds)
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
};

export default {
    state,
    getters,
    actions,
    mutations,
};
