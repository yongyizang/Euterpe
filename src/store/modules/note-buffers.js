import Vue from "vue";
import { createRange } from "../../library/music"

// TODO noteOnBuffer is not used anywhere. 


// TODO the names of most of the buffers/arrays/maps are not representative of 
// their actual functionality

// Create a range of notes from A0 to C8.
// TODO we can use Range.chromatic(["C2", "C3"], { sharps: true }); from the tonaljs package
const notes = createRange("A0", "C8") 
// Create a range of midi numbers from 21 to 108 (piano keys)
const midiNumbers = [...Array(88).keys()].map(i => i + 21);

const measureTicks = [...Array(16).keys()]; // TODO : replace 16 and make it dynamic
// Put all the notes into the notemap, then set all default values to false.

// let pianoState = notes.reduce((map, note) => {
//     map[note.midi] = false
//     return map
// }, {})
let pianoState = midiNumbers.reduce((map, midi) => {
    map[midi] = false
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

// TODO : can I replace const with let here? so I don't have to use the _tmp variables?
let quantizedBufferWorker = measureTicks.reduce((map, tick) => {
    map[tick] = restNote
    return map
}, {})
let quantizedBufferHuman = measureTicks.reduce((map, tick) => {
    map[tick] = restNote
    return map
}, {})


// note as observables
pianoState = new Vue.observable(pianoState)
quantizedBufferWorker = new Vue.observable(quantizedBufferWorker)
quantizedBufferHuman = new Vue.observable(quantizedBufferHuman)
// const lastNotePlayedObs = new Vue.observable("")
// const lastEventTickObs = new Vue.observable(-1)

const state = {
    // Define all basic states.
    pianoState: pianoState,
    quantizedBufferWorker: quantizedBufferWorker,
    quantizedBufferHuman: quantizedBufferHuman,

    // A buffer where we push the (continuous) notes the human plays.
    midiEventBuffer: [],
    noteOnBuffer: [],
    noteOffBuffer: [],

    // The last note (continuous) the human pressed on the keyboard
    // lastNotePlayed: "",
    lastEvent: "",
    lastNoteOnEvent: "",
    lastNoteOffEvent: "",
    lastEventTick: -1,
    lastNoteOnEventTick: -1,
    lastNoteOffEventTick: -1,
    lastEventTick: -1,

    // The last quantized note the human played
    lastHumanQuantizedNote : {"midi" : -1, "cpc" : -1, "name" : "", "dur" : 0, "startTick" : -1},
    // The last note the AI played (quantized by default for a grid-based worker)
    lastWorkerNote :  {"midi" : 0, "cpc" : 12, "name" : "R", "dur" : 1, "startTick" : -1},
    
    // The dictionary that converts note tokens to the indexes that the AI understands
    // For example, the rest token "0_1" is 96
    // other tokens are "60_1" (a C4 onset)
    // or "60_0" (a C4 hold)
    // tokensDict: {}
}

const getters = {
    // Return all notes that are currently "pressed"/active
    // the notes are sorted alphabetically
    getActiveNotes (state){
        const activeNotes = []
        for (const midi of midiNumbers){
          if (state.pianoState[midi]){
              activeNotes.push(midi);
          }
        }
        return activeNotes;
    },
    keyboardIsActive (state, getters){
        return getters.getActiveNotes.length > 0;
    },
    getWorkerPredictionFor: (state) => (currentTick) => {
        return state.quantizedBufferWorker[currentTick]
    },
    getHumanInputFor: (state) => (currentTick) => {
        return state.quantizedBufferHuman[currentTick]
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
    getNoteOnBuffer (state){
        return state.noteOnBuffer;
    },
    getWorkerPredictions (state){
        return state.quantizedBufferWorker;
    },
    // getTokensDict (state){
    //     return state.tokensDict;
    // },
    // these two below are only used by scoreUI
    getLastHumanNoteQuantized (state){
        return state.lastHumanQuantizedNote;
    },
    getLastAINoteQuantized (state){
        return state.lastWorkerNote;
    }
}

const actions = {
    newWorkerPrediction ({ commit, state, getters }, workerPrediction) {
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

                console.assert(midi === state.lastWorkerNote.midi);
                state.lastWorkerNote.dur += 1
            }
        }
    },

    newHumanInputQuantized ({ commit, state, getters }, args) {
        
        // console.log(args)
        // bring midi to the correct range for the AI (ignore 0 which is used for rest)
        var clipedMidi = args.midi
        while (clipedMidi < 28 && clipedMidi > 0){
            clipedMidi += 12
        }
        while (clipedMidi > 94){
            clipedMidi -= 12
        }
        console.log("newHumanInputQuant", clipedMidi)
        // const midiArtic = clipedMidi.toString() + '_' + args.articulation.toString()
        // const midiArticInd = getters.getTokensDict.midiArtic.token2index[midiArtic]
        state.quantizedBufferHuman[getters.getLocalTick] = { "midi" : clipedMidi, 
                                                            "articulation" : args.articulation, 
                                                            "cpc" : args.cpc, 
                                                            // "midiArticInd" : midiArticInd
                                                            // TODO check if I want those also
                                                            // "note" : "R"
                                                        }
        if (args.midi === 0){
            if (state.lastHumanQuantizedNote.midi === 0){
                state.lastHumanQuantizedNote.dur += 1
            }
            else {
                state.lastHumanQuantizedNote.midi = args.midi;
                state.lastHumanQuantizedNote.cpc = args.cpc;
                state.lastHumanQuantizedNote.name = args.name;
                state.lastHumanQuantizedNote.dur = 1;
                state.lastHumanQuantizedNote.startTick = getters.getGlobalTickDelayed();
                // console.log("mesa")
            }
        }
        else {
            if (args.articulation == 1){
                state.lastHumanQuantizedNote.midi = args.midi;
                state.lastHumanQuantizedNote.cpc = args.cpc;
                state.lastHumanQuantizedNote.name = args.name;
                state.lastHumanQuantizedNote.dur = 1;
                state.lastHumanQuantizedNote.startTick = getters.getGlobalTickDelayed();
            }
            else {
                // it should always be
                console.assert(args.midi === state.lastHumanQuantizedNote.midi)
                state.lastHumanQuantizedNote.dur += 1
            }
        }
        // console.log(getters.getGlobalTickDelayed(), " ",
        //     state.lastHumanQuantizedNote.midi, " ",
        // state.lastHumanQuantizedNote.dur, " ",
        // state.lastHumanQuantizedNote.startTick, " ", )

    },

    /*
        Here the behaviors are defined.
        When a note is "on", turn on pianoState and bufferState for that note, then set the last note played to that note.
        When a note is "off", turn off pianoState
    */
    noteOn ({ commit, state, getters }, midiEvent) {
        // note is a string. ie "C5"
        // console.log(getters.getGlobalTickDelayed())
        console.log("noteOn", midiEvent.midi);
        state.pianoState[midiEvent.midi] = true;
        state.noteOnBuffer.push(midiEvent);
        state.midiEventBuffer.push(midiEvent);
        state.lastEvent = midiEvent;
        state.lastEventTick = getters.getGlobalTickDelayed();
        state.lastNoteOnEvent = midiEvent;
        state.lastNoteOnEventTick = getters.getGlobalTickDelayed();
        
    },
    noteOff ({ commit, state, getters }, midiEvent) {
        state.pianoState[midiEvent.midi] = false;
        state.midiEventBuffer.push(midiEvent);
        state.noteOffBuffer.push(midiEvent);
        state.lastEvent = midiEvent;
        state.lastEventTick = getters.getGlobalTickDelayed();
        state.lastNoteOffEvent = midiEvent;
        state.lastNoteOffEventTick = getters.getGlobalTickDelayed();
    },
}

const mutations = {
    clearNoteOnBuffer (state) {
        state.noteOnBuffer = []
    }, 
    // setTokensDict (state, tokensDictFromFile){
    //     state.tokensDict = tokensDictFromFile;
    // },
}

export default {
    state,
    getters,
    actions,
    mutations
}