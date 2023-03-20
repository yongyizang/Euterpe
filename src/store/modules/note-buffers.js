import Vue from "vue";

class NoteEventSortedArray {
    constructor() {
        this.array = [];
    }

    insert(noteEvent) {
    let left = 0;
    let right = this.array.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (this.array[mid].timestamp.tick > noteEvent.timestamp.tick) {
            left = mid + 1;
        } else if (this.array[mid].timestamp.tick < noteEvent.timestamp.tick){
            right = mid - 1;
        }
        else{
            left = mid;
            break;
        }
    }
    this.array.splice(left, 0, noteEvent);
    }

    get(index) {
        return this.array[index];
    }

    remove(index) {
        return this.array.splice(index, 1)[0];
    }

    get length() {
        return this.array.length;
    }
}

// Create a range of midi numbers from 21 to 108 (piano keys)
const pianoMidiNumbers = [...Array(88).keys()].map(i => i + 21);
let pianoState = pianoMidiNumbers.reduce((map, midi) => {
    map[midi] = {status: false, timestamp: 0};
    return map
}, {});

const state = {

    noteTypes: {},
    // Define all basic states.
    pianoMidiNumbers: [],
    pianoState: pianoState,

    // Sorted buffer that stores the Worker's notes to be played
    // at a later tick. They are sorted by their start tick (globalTick).
    // At every tick, the Scheduler will check if the first note in the buffer
    // has a start tick that is equal to the current tick. If so, it will play
    // the note and remove it from the buffer.
    workerNotesToBePlayed: new NoteEventSortedArray(),
    // Buffers where we push the quantized notes played.
    quantizedBufferWorker: [],
    quantizedBufferHuman: [],

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
        // print the length of quantizedBufferWorker
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
    },
    getWorkerNotesToBePlayed (state){
        return state.workerNotesToBePlayed;
    },
    popWorkerNotesToBePlayedAt: (state) => (currentGlobalTick) => {
        const notesToBePlayed = [];
        while (state.workerNotesToBePlayed.length > 0){
            if (state.workerNotesToBePlayed.get(0).timestamp.tick < currentGlobalTick){
                let discard = state.workerNotesToBePlayed.remove(0);
            } else if (state.workerNotesToBePlayed.get(0).timestamp.tick === currentGlobalTick){
                notesToBePlayed.push(state.workerNotesToBePlayed.remove(0));
            }
        }
        return notesToBePlayed;
    }
}

const actions = {
    storeWorkerQuantizedOutput ({ commit, state, getters }, workerNoteEvent) {
        // noteEvent is a dict like this
        // const note = {
        //     player: "worker",
        //     name: null, // BachDuet doesn't generate the note's name
        //     type: articulation === 1 ? noteType.ON : noteType.HOLD,
        //     midi: midi,
        //     chroma: cpc,
        //     velocity: 127, // BachDuet uses 127 for all notes
        //     playAfter: {
                // tick: 1, // play the note at the next tick
                // seconds: 0 // time is not used by BachDuet
        // }

        // increase noteEvent.timestamp.tick by state.globalTick
        // this will be its actual tick when it's supposed to be played
        // and the SortedArray will use that to sort the notes correctly based on their globalTick
        // console.log("inside storeWorkerQuantizedOutput", workerNoteEvent)
        workerNoteEvent.timestamp = {
            tick: workerNoteEvent.playAfter.tick + getters.getGlobalTick,
            seconds: workerNoteEvent.playAfter.seconds
        }
        state.workerNotesToBePlayed.insert(workerNoteEvent);
        // console.log("inside storeWorkerQuantizedOutput insert to play at globalTick", workerNoteEvent.timestamp.tick)
        

        // console.log("notesToBePlayed", state.workerNotesToBePlayed);
        const nextTick = getters.getNextLocalTick;//(noteEvent.tick);
        // console.log("currentTick", getters.getLocalTick);
        // console.log("nextTick", nextTick);
        // store the predicted note in the quantizedBufferWorker 
        state.quantizedBufferWorker[nextTick] = workerNoteEvent

        // now update the lastWorkerNote
        // this is only used in scoreUI.js to display the notes
        // so maybe it should go there
        const midi = workerNoteEvent.midi;
        const cpc = workerNoteEvent.chroma;
        const articulation =  workerNoteEvent.type === state.noteTypes.NOTE_ON ? 1 : 0;

        if (midi == 128) {
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
        const quantizedEventListOnHold = quantizedEventList.filter((event) => event.type === state.noteTypes.NOTE_ON || event.type === state.noteTypes.NOTE_HOLD);

        if ( quantizedEventListOnHold.length > 0 ) {
            args = {midi : quantizedEventList[0].midi,
                    // articulation is 1 if type="on" and 0 if type="hold"
                    articulation : quantizedEventList[0].type === state.noteTypes.NOTE_ON ? 1 : 0,
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
                state.lastHumanQuantizedNote.startTick = getters.getGlobalTickDelayed;
                // console.log("mesa")
            }
        }
        else {
            if (args.articulation == 1){
                state.lastHumanQuantizedNote.midi = args.midi;
                // state.lastHumanQuantizedNote.cpc = args.cpc;
                // state.lastHumanQuantizedNote.name = args.name;
                state.lastHumanQuantizedNote.dur = 1;
                state.lastHumanQuantizedNote.startTick = getters.getGlobalTickDelayed;
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
        state.lastEventTick = getters.getGlobalTickDelayed;
        state.lastNoteOnEvent = midiEvent;
        state.lastNoteOnEventTick = getters.getGlobalTickDelayed;
        
    },
    noteOff ({ commit, state, getters }, midiEvent) {
        state.pianoState[midiEvent.midi].status = false;
        state.pianoState[midiEvent.midi].timestamp = midiEvent.timestamp;

        state.midiEventBuffer.push(midiEvent);
        state.noteOffBuffer.push(midiEvent);

        state.lastEvent = midiEvent;
        state.lastEventTick = getters.getGlobalTickDelayed;
        state.lastNoteOffEvent = midiEvent;
        state.lastNoteOffEventTick = getters.getGlobalTickDelayed;
    },
}

const mutations = {
    // initPianoState (state) {
    //     // Create a range of midi numbers from 21 to 108 (piano keys)
    //     state.pianoMidiNumbers = [...Array(88).keys()].map(i => i + 21);
    //     state.pianoState = state.pianoMidiNumbers.reduce((map, midi) => {
    //         map[midi] = {status: false, timestamp: 0};
    //         return map
    //     }, {});
    // },

    // TODO : see If I can access ticksPerMeasure from global-settings.js
    setNoteTypes (state, noteTypes){
        state.noteTypes = noteTypes;
        console.log(state.noteTypes);
    },
    initQuantBuffers(state, config) {
        const restNote = {
            midi : 128,
            chroma : 12,
            name : "R",
            type : state.noteTypes.REST,
        };
        let ticksPerMeasure = config.ticksPerBeat * config.timeSignature.numerator;
        // initialize quantizedBufferWorker and quantizedBufferHuman with 16 restNotes
        state.quantizedBufferWorker =new Array(ticksPerMeasure).fill(restNote);
        state.quantizedBufferHuman =new Array(ticksPerMeasure).fill(restNote);
    },
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
        // console.log("cleared pianoState");
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}