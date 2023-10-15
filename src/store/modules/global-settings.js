import Vue from "vue";

const state = {
  config: null,
  sessionID: null,
  clockStatus: false,
  clockInitialized: false,
  currentBPM: null,
  frequency: null,
  // randomness: null,
  modalStatus: false,
};

const getters = {
  getConfig(state) {
    return state.config;
  },
  getClockStatus(state){
    return state.clockStatus;
  },
  getClockInitialized(state){
    return state.clockInitialized;
  },
  getBPM(state){
    return state.currentBPM;
  },
  // getRandomness(state){
  //   return state.randomness;
  // },
  getModalStatus(state){
    return state.modalStatus;
  },
  getTSNom(state){
    // if (state.config.event-based) return null;
    return state.config.clockSettings.timeSignature.numerator;
  },
  getTSDenom(state){
    return state.config.clockSettings.timeSignature.denominator;
  },
  getTicksPerBeat(state){
    return state.config.clockSettings.ticksPerBeat;
  },
  getTicksPerMeasure(state){
    return state.config.clockSettings.timeSignature.numerator * state.config.clockSettings.ticksPerBeat;
  },
  getSecondsPerTick(state){
    // console.log("state.bpm: " + state.bpm, "state.config.clockSettings.ticksPerBeat: " + state.config.clockSettings.ticksPerBeat);
    return 60 / state.currentBPM / state.config.clockSettings.ticksPerBeat;
  },
  // example getter. This will get BPM from global-settings module, then calculate the new clock period.
  getClockPeriod (state, getters, rootState, rootGetters) {
    // return (60 / rootGetters['global-settings/getBPM'] / rootGetters['global-settings/getTicksPerMeasure']) * 1000;
    return (60 / state.currentBPM / getters.getTicksPerBeat) * 1000;
},
};

const actions = {};

const mutations = {
  setConfig (state, config){
    state.config = config;
    state.currentBPM = config.clockSettings.defaultBPM;
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
    console.log("setBPM: " + bpm);
    state.currentBPM = bpm;
  },
  changeModalStatus(state){
    state.modalStatus = !state.modalStatus;
  },
  // setRandomness(state, randomness){
  //   state.randomness = randomness;
  // }
};

export default {
  state,
  getters,
  actions,
  mutations,
};
