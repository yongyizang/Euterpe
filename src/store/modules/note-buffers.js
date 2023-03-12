import Vue from "vue";
import { Range } from "@tonaljs/tonal";

// FROM Yongyi's yaml I get
const MODE = "GRID"; // or "CONTINUOUS"
// If GRID, then we need BPM, GRID, TS_NOM, TS_DEN
// If CONTINUOUS, then we need PERIOD
const BPM = 90;
const TICKS_PER_BEAT = 4; // this is the number of ticks per beat
const TS_NOM = 4; // this is the numerator of the time signature
const TS_DEN = 4; // this is the denominator of the time signature
let CLOCK_PERIOD = null;
let TICKS_PER_MEASURE = null;
let GRID_TICK_PERIOD = null;
let QUANTIZED_BUFFER_SIZE = null;
if (MODE === "GRID") {
    // in GRID mode, the clock period is the same as the grid tick duration
    // for example if we have a 4/4 time signature, and a 16th note grid, then
    // the grid tick duration is 60 / 90 / 4 = 0.25 seconds
    // and the clock ticks every 0.25 seconds as well
    GRID_TICK_PERIOD = (60 / BPM / TICKS_PER_BEAT) * 1000;
    CLOCK_PERIOD = GRID_TICK_PERIOD;
    TICKS_PER_MEASURE = TS_NOM * TICKS_PER_BEAT;
    // In GRID mode, the quantized buffer size is the same as the number of ticks per measure
    QUANTIZED_BUFFER_SIZE = TICKS_PER_MEASURE;
}
else if (MODE === "CONTINUOUS") {
    // CLOCK_PERIOD needs not to be null.
    if (CLOCK_PERIOD === null) {
        throw new Error("CLOCK_PERIOD cannot be null in CONTINUOUS mode.");
    }
    GRID_TICK_PERIOD = CLOCK_PERIOD;
    // In CONTINUOUS mode, the quant buffer size doesn't have any physical meaning,
    // I just set it to 16 for now
    QUANTIZED_BUFFER_SIZE = 16;
}

const notes = Range.chromatic(["A0", "C8"], { sharps: true });
// Create a range of midi numbers from 21 to 108 (piano keys)
const pianoMidiNumbers = [...Array(88).keys()].map(i => i + 21);
const measureTicks = [...Array(QUANTIZED_BUFFER_SIZE).keys()];

let pianoState = pianoMidiNumbers.reduce((map, midi) => {
    map[midi] = {status: false, timestamp: 0};
    return map
}, {})

const emptyNote = {"midi" : -1, 
                    "cpc" : -1, 
                    "name" : "", 
                    // "dur" : 0, 
                    "articulation" : -1, 
                    // "tick" : -1, 
                    // "startTick" : -1,
                }
const restNote = {"midi" : 0,
                    "cpc" : 12,
                    "name" : "R",
                    // "dur" : 0,
                    "articulation" : 1,
                    }

let quantizedBufferWorker = measureTicks.reduce((map, tick) => {
    map[tick] = restNote
    return map
}, {})
let quantizedBufferHuman = measureTicks.reduce((map, tick) => {
    map[tick] = restNote
    return map
}, {})


pianoState = new Vue.observable(pianoState)
quantizedBufferWorker = new Vue.observable(quantizedBufferWorker)
quantizedBufferHuman = new Vue.observable(quantizedBufferHuman)
// const lastNotePlayedObs = new Vue.observable("")
// const lastEventTickObs = new Vue.observable(-1)

const state = {
    // Define all basic states.
    pianoState: pianoState,

    // Buffers where we push the quantized notes played.
    // in grid mode, the quantized positions have a musical meaning
    // in continuous mode, the quantized positions are just the time and depend on the CLOCK_PERIOD
    quantizedBufferWorker: quantizedBufferWorker,
    quantizedBufferHuman: quantizedBufferHuman,

    // Buffers where we push the (continuous/unquantized) notes the human plays.
    // these are cleared after each clock tick
    midiEventBuffer: [],
    noteOnBuffer: [],
    noteOffBuffer: [],

    // The last note (continuous) the human pressed on the keyboard
    // lastNotePlayed: "",
    // TODO : group all these things into a single object
    // like lastUnquantizedEvent, lastQuantizedEvent
    lastEvent: "",
    lastNoteOnEvent: "",
    lastNoteOffEvent: "",
    lastEventTick: -1,
    lastNoteOnEventTick: -1,
    lastNoteOffEventTick: -1,
    lastEventTick: -1,

    // TODO : why do I need these ? I can just grab the last element of the quantizedBuffers
    // The last quantized note the human played
    lastHumanQuantizedNote : {"midi" : -1, "cpc" : -1, "name" : "", "dur" : 0, "startTick" : -1},
    // The last note the AI played (quantized by default for a grid-based worker)
    lastWorkerNote :  {"midi" : 0, "cpc" : 12, "name" : "R", "dur" : 1, "startTick" : -1},
    
}

const getters = {
    // Return all notes that are currently "pressed"/active
    // the notes are sorted alphabetically
    getActivePianoNotes (state){
        const activePianoNotes = []
        for (const midi of pianoMidiNumbers){
            let pianoKeyStatus = state.pianoState[midi].status;
            let pianoKeyTimestamp = state.pianoState[midi].timestamp;
            if (pianoKeyStatus){
                activePianoNotes.push({midi: midi, timestamp: pianoKeyTimestamp});
          }
        }
        // sort the notes by timestamp
        activePianoNotes.sort((a, b) => b.timestamp - a.timestamp);
        return activePianoNotes;
    },
    keyboardIsActive (state, getters){
        return getters.getActivePianoNotes.length > 0;
    },
    getWorkerPredictionFor: (state) => (currentTick) => {
        return state.quantizedBufferWorker[currentTick]
    },
    getHumanInputFor: (state) => (currentTick) => {
        return state.quantizedBufferHuman[currentTick]
    },

    // example getter. This will get BPM from global-settings module, then calculate the new clock period.
    getNewClockPeriod (states, getters, rootState, rootGetters) {
        return (60 / rootGetters['global-settings/getBPM'] / rootGetters['global-settings/getTicksPerMeasure']) * 1000;
    },

    // trivial getters that just get stuff
    getPianoState (state){
        return state.pianoState;
    },
    getLastEvent (state){
        return state.lastEvent;
    },
    getLastNoteOnEvent (state){
        return state.lastNoteOnEvent;
    },
    getLastNoteOffEvent (state){
        return state.lastNoteOffEvent;
    },
    getLastEventTick (state){
        return state.lastEventTick;
    },
    getLastNoteOnEventTick (state){
        return state.lastNoteOnEventTick;
    },
    getLastNoteOffEventTick (state){
        return state.lastNoteOffEventTick;
    },
    getNoteOffBuffer (state){
        return state.noteOffBuffer;
    },
    getNoteOnBuffer (state){
        return state.noteOnBuffer;
    },
    getMidiEventBuffer (state){
        return state.midiEventBuffer;
    },

    getQuantizedBufferWorker (state){
        return state.quantizedBufferWorker;
    },
    getQuantizedBufferHuman (state){
        return state.quantizedBufferHuman;
    },
    // these two below are only used by scoreUI
    getLastHumanNoteQuantized (state){
        return state.lastHumanQuantizedNote;
    },
    getLastAINoteQuantized (state){
        return state.lastWorkerNote;
    }
}

const actions = {
    storeWorkerQuantizedOutput ({ commit, state, getters }, workerPrediction) {
        // workerPrediction is a dict like this
        // message: {
        //     predictTime: predictTime,
        //     tick: currentTick,
        //     note: {
        //         midi: midi,
        //         articulation: articulation,
        //         cpc: cpc,
        //     },
        // }
        const nextTick = getters.getNextLocalTick(workerPrediction.tick);
        // store the predicted note in the quantizedBufferWorker 
        state.quantizedBufferWorker[nextTick] = workerPrediction.note

        // now update the lastWorkerNote
        // this is only used in scoreUI.js to display the notes
        // so maybe it should go there
        const midi = workerPrediction.note.midi;
        const cpc = workerPrediction.note.cpc;
        const articulation =  workerPrediction.note.articulation;

        if (midi == 0) {
            if (state.lastWorkerNote.midi == 0){
                state.lastWorkerNote.dur += 1
            }
            else {
                state.lastWorkerNote.midi = midi;
                state.lastWorkerNote.cpc = cpc;
                // state.lastWorkerNote.name = name;
                state.lastWorkerNote.dur = 1;
                state.lastWorkerNote.startTick = getters.getGlobalTick;
            }
        }
        else {
            if (articulation == 1){
                state.lastWorkerNote.midi = midi;
                state.lastWorkerNote.cpc = cpc;
                // state.lastWorkerNote.name = name;
                state.lastWorkerNote.dur = 1;
                state.lastWorkerNote.startTick = getters.getGlobalTick;
            }
            else {
                // It comes here when the AI generates notes with artic=0
                // without previously generating the same note with artic=1
                // this will happen maybe at the first 1-2 tokens generated by the NN
                // or more often if the temperature/randomness is set to a high number

                // console.assert(midi === state.lastWorkerNote.midi);
                state.lastWorkerNote.dur += 1
            }
        }
    },

    storeHumanQuantizedInput ({ commit, state, getters }, quantizedEventList) {
        
        // console.log(args)
        // console.log("newHumanInputQuant", clipedMidi)
        // const midiArtic = clipedMidi.toString() + '_' + args.articulation.toString()
        // const midiArticInd = getters.getTokensDict.midiArtic.token2index[midiArtic]
        state.quantizedBufferHuman[getters.getLocalTick] = quantizedEventList
        // console.log(quantizedEventList);

        // for (let i = 0; i < quantizedEventList.length; i++) {
        //     const { type, midi } = quantizedEventList[i];
            
        //     // Print the object's fields to the console
        //     console.log(`tick ${getters.getLocalTick} type: ${type}, midi: ${midi}`);
        // }

        // TODO : I still need this to display the notes in the scoreUI  
        // TODO : Move this ugly code to scoreUI.js 
        let args = {};
        // keep only the "on" and "hold" type events from quantizedEventList in a new array
        const quantizedEventListOnHold = quantizedEventList.filter((event) => event.type === "on" || event.type === "hold");

        if ( quantizedEventListOnHold.length > 0 ) {
            args = {midi : quantizedEventList[0].midi,
                    // articulation is 1 if type="on" and 0 if type="hold"
                    articulation : quantizedEventList[0].type === "on" ? 1 : 0,
            }
        }
        else {
            args.midi = 0;
            args.articulation = 1;
        }
        if (args.midi === 0){
            if (state.lastHumanQuantizedNote.midi === 0){
                state.lastHumanQuantizedNote.dur += 1
            }
            else {
                state.lastHumanQuantizedNote.midi = args.midi;
                // state.lastHumanQuantizedNote.cpc = args.cpc;
                // state.lastHumanQuantizedNote.name = args.name;
                state.lastHumanQuantizedNote.dur = 1;
                state.lastHumanQuantizedNote.startTick = getters.getGlobalTickDelayed();
                // console.log("mesa")
            }
        }
        else {
            if (args.articulation == 1){
                state.lastHumanQuantizedNote.midi = args.midi;
                // state.lastHumanQuantizedNote.cpc = args.cpc;
                // state.lastHumanQuantizedNote.name = args.name;
                state.lastHumanQuantizedNote.dur = 1;
                state.lastHumanQuantizedNote.startTick = getters.getGlobalTickDelayed();
            }
            else {
                // it should always be
                // console.assert(args.midi === state.lastHumanQuantizedNote.midi)
                state.lastHumanQuantizedNote.dur += 1
            }
        }
    },

    /*
        Here the behaviors are defined.
        When a note is "on", turn on pianoState and bufferState for that note, then set the last note played to that note.
        When a note is "off", turn off pianoState
    */
    noteOn ({ commit, state, getters }, midiEvent) {
        // Everything starts Here.

        // console.log("noteOn", midiEvent.midi);
        state.pianoState[midiEvent.midi].status = true;
        state.pianoState[midiEvent.midi].timestamp = midiEvent.timestamp;

        state.noteOnBuffer.push(midiEvent);
        state.midiEventBuffer.push(midiEvent);

        state.lastEvent = midiEvent;
        state.lastEventTick = getters.getGlobalTickDelayed();
        state.lastNoteOnEvent = midiEvent;
        state.lastNoteOnEventTick = getters.getGlobalTickDelayed();
        
    },
    noteOff ({ commit, state, getters }, midiEvent) {
        state.pianoState[midiEvent.midi].status = false;
        state.pianoState[midiEvent.midi].timestamp = midiEvent.timestamp;

        state.midiEventBuffer.push(midiEvent);
        state.noteOffBuffer.push(midiEvent);

        state.lastEvent = midiEvent;
        state.lastEventTick = getters.getGlobalTickDelayed();
        state.lastNoteOffEvent = midiEvent;
        state.lastNoteOffEventTick = getters.getGlobalTickDelayed();
    },
}

const mutations = {
    clearContinuousBuffers (state) {
        state.noteOnBuffer = [];
        state.midiEventBuffer = [];
        state.noteOffBuffer = [];
    }, 
    clearPianoState(state) {
        for (const i of pianoMidiNumbers) {
            state.pianoState[i].status = false;
            state.pianoState[i].timestamp = 0;
        }
        console.log("cleared pianoState");
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}