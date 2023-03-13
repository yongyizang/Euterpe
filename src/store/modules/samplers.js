import Vue from "vue";
import * as Tone from "tone";
import Instruments from "@/library/instruments";

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
    samplerOn(state, {midiEvent, delay}){
        // {samplerName, currentNote, time}
        if (midiEvent.player == "human"){
            // let skata = Tone.now();
            // console.log(skata);
            // console.log(delay);
            humanSampler.triggerAttack(midiEvent.note, Tone.now() + delay, midiEvent.velocity / 127);
        } else if (midiEvent.player == "worker"){
            workerSampler.triggerAttack(midiEvent.note, Tone.now() + delay, midiEvent.velocity / 127);
        } else if (midiEvent.player == "metronome"){
            metronomeSampler.triggerAttack(midiEvent.note, Tone.now() + delay);
            // release the note 0.5s after the attack
            // TODO : make that depend on the beat duration
            metronomeSampler.triggerRelease(midiEvent.note, Tone.now() + delay + 500);
        }
    },
    samplerOff(state, {midiEvent, delay}){
        if (midiEvent.player == "human"){
            humanSampler.triggerRelease(midiEvent.note, Tone.now() + delay);
        } else if (midiEvent.player == "worker"){
            workerSampler.triggerRelease(midiEvent.note, Tone.now() + delay);
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
