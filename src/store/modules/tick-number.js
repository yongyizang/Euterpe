import Vue from "vue";

/*Initial state of three Tick number
globalTick is the Tick number for the whole process of the midi IO
localTick is the Tick number for only one measure, cannot be greater than 16
barTick is the number of the measures played
 */
const state = {
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
    // TODO : here there are two ways to write a getter.
    // For the first way, we use the function as var tick = getGlobalTickDelayed;
    // For the second we have to use it like : var tick = getGlobalTickDelayed();
    // I prefer the second way. What do you think ? 
    // getGlobalTickDelayed (state){
    //     return state.globalTickDelayed;
    // },
    getGlobalTickDelayed: (state) => () => {
        return state.globalTickDelayed;
    },
    getBarTick (state){
        return state.barTick;
    },
    getBarNumber (state){
        return state.barNumber;
    },
    isNewBar (state){
        return state.localTick % 16 === 0;
    },
    getNextLocalTickAfter: (state) => (currentTick) => {
        return (currentTick + 1) % 16;
    },
    getNextLocalTick: (state) => () => {
        return (state.localTick + 1) % 16;
    }
}

const actions = {
}

/*
AddTick is the func. for changing the value of the three Tick number.
 */
const mutations = {
    incrementTick (state) {
        state.globalTick += 1;
        state.localTick += 1;
        state.barTick += 1;
        state.localTick = state.localTick % 16;
        if (state.localTick == 0){
            state.barNumber += 1;
        };
        state.barTick = Math.floor(state.globalTick / 16); 
        // console.log('incrementTick to ', state.localTick)
    },
    incrementTickDelayed (state) {
        state.localTickDelayed += 1;
        state.localTickDelayed = state.localTickDelayed % 16;
        state.globalTickDelayed += 1;
        // console.log('incrementDelayedTick to ', state.localTickDelayed)
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}