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
  // static
  // ts_nom: 4, // time signature numerator (number of beats)
  // ts_denom: 4, // time signature denominator (note value of a beat)
  // grid: 4, // grid resolution per beat (4 = 16th notes for a time signature of 4/4)
};

const getters = {
  getConfig(state) {
    return state.config;
  },
  // get the intro type writer animation text
  getLoadingtext(state){
    return state.config.introTypewriterContent;
  },
  getWorkerParams(state){
    return state.config.workerParams;
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
    if (state.config.event-based) return null;
    return state.config.clockBased.timeSignature.numerator;
  },
  getTSDenom(state){
    return state.ts_denom;
  },
  getGrid(state){
    return state.grid;
  },
  getTicksPerMeasure(state){
    return state.ts_nom * state.grid;
  }
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
