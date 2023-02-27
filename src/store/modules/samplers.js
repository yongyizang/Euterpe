import Vue from "vue";
import * as Tone from "tone";
import Instruments from "@/library/instruments";

window.onclick = () => {
    Tone.start();
    Tone.context.lookAhead = 0;
  };

const userSampler = new Instruments().createSampler("piano", (piano) => {
    piano.toDestination();
});

const WorkerSampler = new Instruments().createSampler("piano", (piano) => {
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
    userSamplerGain: 0, // in dB
    WorkerSamplerGain: 0, // in dB
};

const getters = {
    getMetronomeStatus(state){
        return state.metronomeStatus;
    },
    getUserSamplerGain(state){
        return state.userSamplerGain;
    },
    getWorkerSamplerGain(state){
        return state.WorkerSamplerGain;
    }
};

const actions = {
    samplerOn(state, midiEvent, delay){
        // {samplerName, currentNote, time}
        if (payload.name == "human"){
            userSampler.triggerAttack(midiEvent.note, Tone.now() + delay);
        } else if (payload.name == "worker"){
            WorkerSampler.triggerAttack(midiEvent.note, Tone.now() + delay);
        } else if (payload.name == "metronome"){
            metronomeSampler.triggerAttack(midiEvent.note, Tone.now() + delay);
            // release the note 0.5s after the attack
            metronomeSampler.triggerRelease(midiEvent.note, Tone.now() + delay + 500);
        }
    },
    samplerOff(state, payload, delay){
        if (payload.name == "human"){
            userSampler.triggerRelease(midiEvent.note, Tone.now() + delay);
        } else if (payload.name == "worker"){
            WorkerSampler.triggerRelease(midiEvent.note, Tone.now() + delay);
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
    setUserPianoVolume(state, volume){
        if (volume == 10){
            state.userSamplerGain = 0;
        } else{
            var toDB = -Math.abs(20*Math.log(volume/10));
            state.userSamplerGain = toDB;
        }
        userSampler.volume.value = state.userSamplerGain;
    },
    setAIPianoVolume(state, volume){
        if (volume == 10){
            state.WorkerSamplerGain = 0;
        } else {
            var toDB = -Math.abs(20*Math.log(volume/10));
            state.WorkerSamplerGain = toDB;
        };
        WorkerSampler.volume.value = state.WorkerSamplerGain;
    },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
