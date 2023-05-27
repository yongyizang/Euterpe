import Vue from "vue";

/*Initial state of three Tick number
globalTick is the Tick number for the whole process of the midi IO
localTick is the Tick number for only one measure, cannot be greater than 16
barTick is the number of the measures played
 */
const state = {
    ticksPerMeasure: null,
    globalTick: -1,
    localTick: -1,
    localTickDelayed: -1,
    globalTickDelayed: -1,
    barTick: -1,
    barNumber: 0,
}

//Getters for globalTick, localTick, barTick
const getters = {
    getGlobalTick (state) {
        return state.globalTick;
    },
    getLocalTick (state){
        return state.localTick;
    },
    getLocalTickDelayed (state){
        return state.localTickDelayed;
    },
    getGlobalTickDelayed (state){
        return state.globalTickDelayed;
    },
    getBarTick (state){
        return state.barTick;
    },
    getBarNumber (state){
        return state.barNumber;
    },
    isNewBar (state){
        return state.localTick % state.ticksPerMeasure === 0;
    },
    getNextLocalTickAfter: (state) => (currentTick) => {
        return (currentTick + 1) % state.ticksPerMeasure;
    },
    getNextLocalTick (state){
        return (state.localTick + 1) % state.ticksPerMeasure;
    }
}

const actions = {
}

/*
AddTick is the func. for changing the value of the three Tick number.
 */
const mutations = {
    setTicksPerMeasure (state, config){
        state.ticksPerMeasure = config.clockBasedSettings.ticksPerBeat * config.clockBasedSettings.timeSignature.numerator;
    },
    incrementTick (state) {
        state.globalTick += 1;
        state.localTick += 1;
        state.barTick += 1;
        state.localTick = state.localTick % state.ticksPerMeasure;
        if (state.localTick == 0){
            state.barNumber += 1;
        };
        state.barTick = Math.floor(state.globalTick / state.ticksPerMeasure); 
        console.log('incrementTick to ', state.globalTick);
    },
    incrementTickDelayed (state) {
        state.localTickDelayed += 1;
        state.localTickDelayed = state.localTickDelayed % state.ticksPerMeasure;
        state.globalTickDelayed += 1;
        console.log('incrementDelayedTick to ', state.globalTickDelayed);
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}