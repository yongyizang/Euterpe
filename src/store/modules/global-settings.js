import Vue from "vue";

/*
 Work in progress.
 We should move every "global" setting (for example, BPM, color, gain levels, etc.) in here.
*/

const state = {
  config: null,
  sessionID: null,
  clockStatus: false,
  clockInitialized: false,
  bpm: null,
  frequency: null,
  randomness: null,
  modalStatus: false,
};

const getters = {
  getConfig(state) {
    return state.config;
  },
  // get the intro type writer animation text
  getLoadingtext(state){
    return state.config.introTypewriterContent;
  },
  getClockStatus(state){
    return state.clockStatus;
  },
  getClockInitialized(state){
    return state.clockInitialized;
  },
  getBPM(state){
    return state.bpm;
  },
  getRandomness(state){
    return state.randomness;
  },
  getModalStatus(state){
    return state.modalStatus;
  },
  getTSNom(state){
    // if (state.config.event-based) return null;
    return state.config.timeSignature.numerator;
  },
  getTSDenom(state){
    return state.config.timeSignature.denominator;
  },
  getTicksPerBeat(state){
    return state.config.ticksPerBeat;
  },
  getTicksPerMeasure(state){
    return state.config.timeSignature.numerator * state.config.ticksPerBeat;
  },
  // example getter. This will get BPM from global-settings module, then calculate the new clock period.
  getClockPeriod (state, getters, rootState, rootGetters) {
    // return (60 / rootGetters['global-settings/getBPM'] / rootGetters['global-settings/getTicksPerMeasure']) * 1000;
    return (60 / state.bpm / getters.getTicksPerBeat) * 1000;
},
};

const actions = {};

const mutations = {
  setConfig (state, config){
    state.config = config;
  },
  writeSessionID(state, id){
    state.sessionID = id;
    console.log(id);
  },
  changeClockStatus(state){
    state.clockStatus = !state.clockStatus;
  },
  setClockStatus(state, status){
    state.clockStatus = status;
  },
  initializeClock(state){
    state.clockInitialized = true;
  },
  setBPM(state, bpm){
    state.bpm = bpm;
  },
  changeModalStatus(state){
    state.modalStatus = !state.modalStatus;
  },
  setRandomness(state, randomness){
    state.randomness = randomness;
  }
};

export default {
  state,
  getters,
  actions,
  mutations,
};
