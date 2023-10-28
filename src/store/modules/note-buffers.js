import Vue from 'vue';

class NoteEventSortedArray {
  constructor() {
    this.array = [];
  }

  insert(noteEvent) {
    let left = 0;
    let right = this.array.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (this.array[mid]._playAt.tick > noteEvent._playAt.tick) {
        right = mid - 1;
      } else if (this.array[mid]._playAt.tick < noteEvent._playAt.tick) {
        left = mid + 1;
      } else {
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
const pianoMidiNumbers = [...Array(88).keys()].map((i) => i + 21);
const pianoState = pianoMidiNumbers.reduce((map, midi) => {
  map[midi] = {status: false, timestamp: 0};
  return map;
}, {});

const state = {

  noteType: {},
  // Define all basic states.
  pianoMidiNumbers: [],
  pianoState: pianoState,

  // Sorted buffer that stores the Agents's notes to be played
  // at a later tick. They are sorted by their start tick (globalTick).
  // At every tick, the Scheduler will check if the first note in the buffer
  // has a start tick that is equal to the current tick. If so, it will play
  // the note and remove it from the buffer.
  agentNotesToBePlayed: new NoteEventSortedArray(),
  // Buffers where we push the quantized notes played.
  quantizedBufferAgent: [],
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
  lastEvent: '',
  lastNoteOnEvent: '',
  lastNoteOffEvent: '',
  lastEventTick: -1,
  lastNoteOnEventTick: -1,
  lastNoteOffEventTick: -1,
  lastEventTick: -1,

  // TODO : why do I need these ? I can just grab the last element of the quantizedBuffers
  // The last quantized note the human played
  lastHumanQuantizedNote: {'midi': -1, 'cpc': -1, 'name': '', 'dur': 0, 'startTick': -1},
  // The last note the AI played (quantized by default for a grid-based worker)
  lastAgentNote: {'midi': 0, 'cpc': 12, 'name': 'R', 'dur': 1, 'startTick': -1},

};

const getters = {
  getNoteType(state) {
    return state.noteType;
  },
  // Return all notes that are currently "pressed"/active
  // the notes are sorted alphabetically
  getActivePianoNotes(state) {
    const activePianoNotes = [];
    for (const midi of pianoMidiNumbers) {
      const pianoKeyStatus = state.pianoState[midi].status;
      const pianoKeyTimestamp = state.pianoState[midi].timestamp;
      if (pianoKeyStatus) {
        activePianoNotes.push({midi: midi, timestamp: pianoKeyTimestamp});
      }
    }
    // sort the notes by timestamp
    activePianoNotes.sort((a, b) => b.timestamp - a.timestamp);
    return activePianoNotes;
  },
  keyboardIsActive(state, getters) {
    return getters.getActivePianoNotes.length > 0;
  },
  getAgentPredictionFor: (state) => (currentTick) => {
    // print the length of quantizedBufferAgent
    return state.quantizedBufferAgent[currentTick];
  },
  getHumanInputFor: (state) => (currentTick) => {
    return state.quantizedBufferHuman[currentTick];
  },
  // trivial getters that just get stuff
  getPianoState(state) {
    return state.pianoState;
  },
  getLastEvent(state) {
    return state.lastEvent;
  },
  getLastNoteOnEvent(state) {
    return state.lastNoteOnEvent;
  },
  getLastNoteOffEvent(state) {
    return state.lastNoteOffEvent;
  },
  getLastEventTick(state) {
    return state.lastEventTick;
  },
  getLastNoteOnEventTick(state) {
    return state.lastNoteOnEventTick;
  },
  getLastNoteOffEventTick(state) {
    return state.lastNoteOffEventTick;
  },
  getNoteOffBuffer(state) {
    return state.noteOffBuffer;
  },
  getNoteOnBuffer(state) {
    return state.noteOnBuffer;
  },
  getMidiEventBuffer(state) {
    return state.midiEventBuffer;
  },

  getQuantizedBufferAgent(state) {
    return state.quantizedBufferAgent;
  },
  getQuantizedBufferHuman(state) {
    return state.quantizedBufferHuman;
  },
  // these two below are only used by score
  getLastHumanNoteQuantized(state) {
    return state.lastHumanQuantizedNote;
  },
  getLastAINoteQuantized(state) {
    return state.lastAgentNote;
  },
  getAgentNotesToBePlayed(state) {
    return state.agentNotesToBePlayed;
  },
  popAgentNotesToBePlayedAt: (state) => (currentGlobalTick) => {
    const notesToBePlayed = [];
    const numElems = state.agentNotesToBePlayed.length;
    if (numElems > 0) {
      let ind = 0;
      while (state.agentNotesToBePlayed.length > 0 && ind <= numElems) {
        if (state.agentNotesToBePlayed.get(0)._playAt.tick < currentGlobalTick) {
          const discard = state.agentNotesToBePlayed.remove(0);
          ind++;
        } else if (state.agentNotesToBePlayed.get(0)._playAt.tick === currentGlobalTick) {
          notesToBePlayed.push(state.agentNotesToBePlayed.remove(0));
          ind++;
        } else {
          ind++;
        }
      }
    }
    // console.log("popAgentNotesToBePlayedAt tick ", currentGlobalTick, " notesToBePlayed ", notesToBePlayed)
    return notesToBePlayed;
  },
};

const actions = {
  updateLastAgentNote({commit, state, getters}, workerNoteEvents) {
    const noteOnEvents = workerNoteEvents.filter((event) =>
      event.type === state.noteType.NOTE_ON);
    const noteOffEvents = workerNoteEvents.filter((event) =>
      event.type === state.noteType.NOTE_OFF);

    if (noteOnEvents.length > 0) {
      // console.error("Agent's output is not monophonic, score can't work properly");
      // console.log("noteOnEvents", noteOnEvents);
      state.lastAgentNote.midi = noteOnEvents[0].midi;
      // state.lastAgentNote.cpc =
      state.lastAgentNote.dur = 1;
      state.lastAgentNote.startTick = getters.getGlobalTick;
    } else if (noteOnEvents.length == 0 && noteOffEvents.length == 0) {
      state.lastAgentNote.dur += 1;
    } else if (noteOnEvents.length == 0 && noteOffEvents.length > 0) {
      if (noteOffEvents[0].midi == state.lastAgentNote.midi) {
        state.lastAgentNote.midi = 0;
        state.lastAgentNote.dur = 1;
        state.lastAgentNote.startTick = getters.getGlobalTick;
      } else {
        console.error('Agent\'s output is not monophonic, score can\'t work properly (2)');
      }
    }
    // console.log("lastAgentNote midi ", state.lastAgentNote.midi, " dur ", state.lastAgentNote.dur, " startTick ", state.lastAgentNote.startTick);
  },
  updateLastAgentNote2({commit, state, getters}, workerNoteEvents) {
    // now update the lastAgentNote
    // this is only used in score.js to display the notes
    // so maybe it should go there
    let workerNoteEvent = null;
    let midi = 0;
    let articulation = 1;
    let cpc = 12;
    if (workerNoteEvents.length > 0) {
      workerNoteEvent = workerNoteEvents[0];

      midi = workerNoteEvent.midi;
      cpc = workerNoteEvent.chroma;
      articulation = workerNoteEvent.type === state.noteType.NOTE_ON ? 1 : 0;
    }
    // else {
    //     midi = 0;
    // }

    if (midi == 0) {
      if (state.lastAgentNote.midi == 0) {
        state.lastAgentNote.dur += 1;
      } else {
        state.lastAgentNote.midi = 0;
        state.lastAgentNote.cpc = 12;
        // state.lastAgentNote.name = name;
        state.lastAgentNote.dur = 1;
        state.lastAgentNote.startTick = getters.getGlobalTick;
      }
    } else {
      if (articulation == 1) {
        state.lastAgentNote.midi = midi;
        state.lastAgentNote.cpc = cpc;
        // state.lastAgentNote.name = name;
        state.lastAgentNote.dur = 1;
        state.lastAgentNote.startTick = getters.getGlobalTick;
      } else {
        // BachDuet specific
        // It comes here when the AI generates notes with artic=0
        // without previously generating the same note with artic=1
        // this will happen maybe at the first 1-2 tokens generated by the NN
        // or more often if the temperature/randomness is set to a high number

        // console.assert(midi === state.lastAgentNote.midi);
        state.lastAgentNote.dur += 1;
      }
    }
  },

  storeAgentQuantizedOutput({commit, state, getters}, workerNoteEvent) {
    // set the playAt to noteEvent.playAfter.tick + state.globalTick
    // this will be its actual tick when it's supposed to be played
    // and the SortedArray will use that to sort the notes correctly based on their globalTick
    // console.log("inside storeAgentQuantizedOutput", workerNoteEvent)
    workerNoteEvent._playAt = {
      tick: workerNoteEvent.playAfter.tick + getters.getGlobalTickDelayed - 1,
      seconds: workerNoteEvent.playAfter.seconds,
    };
    state.agentNotesToBePlayed.insert(workerNoteEvent);
    // console.log("pushed to agentNotesToBePlayed", workerNoteEvent);
    // const nextTick = getters.getNextLocalTick;//(noteEvent.tick);
    // store the predicted note in the quantizedBufferAgent
    // state.quantizedBufferAgent[nextTick] = workerNoteEvent

    // // now update the lastAgentNote
    // // this is only used in score.js to display the notes
    // // so maybe it should go there
    // const midi = workerNoteEvent.midi;
    // const cpc = workerNoteEvent.chroma;
    // const articulation =  workerNoteEvent.type === state.noteType.NOTE_ON ? 1 : 0;

    // if (midi == 0) {
    //     if (state.lastAgentNote.midi == 0){
    //         state.lastAgentNote.dur += 1
    //     }
    //     else {
    //         state.lastAgentNote.midi = 0;
    //         state.lastAgentNote.cpc = 12;
    //         // state.lastAgentNote.name = name;
    //         state.lastAgentNote.dur = 1;
    //         state.lastAgentNote.startTick = getters.getGlobalTick;
    //     }
    // }
    // else {
    //     if (articulation == 1){
    //         state.lastAgentNote.midi = midi;
    //         state.lastAgentNote.cpc = cpc;
    //         // state.lastAgentNote.name = name;
    //         state.lastAgentNote.dur = 1;
    //         state.lastAgentNote.startTick = getters.getGlobalTick;
    //     }
    //     else {
    //         // BachDuet specific
    //         // It comes here when the AI generates notes with artic=0
    //         // without previously generating the same note with artic=1
    //         // this will happen maybe at the first 1-2 tokens generated by the NN
    //         // or more often if the temperature/randomness is set to a high number

    //         // console.assert(midi === state.lastAgentNote.midi);
    //         state.lastAgentNote.dur += 1
    //     }
    // }
  },

  storeHumanQuantizedInput({commit, state, getters}, quantizedEventList) {
    state.quantizedBufferHuman[getters.getLocalTick] = quantizedEventList;
    // TODO : I still need this to display the notes in the score
    // TODO : Move this code to score.js
    let args = {};
    // console.log("in store", quantizedEventList)
    // keep only the "on" and "hold" type events from quantizedEventList in a new array
    const quantizedEventListOnHold = quantizedEventList.filter((event) => event.type === state.noteType.NOTE_ON || event.type === state.noteType.NOTE_HOLD);
    // console.log("in store ON HOLD", quantizedEventListOnHold);
    if ( quantizedEventListOnHold.length > 0 ) {
      args = {midi: quantizedEventList[0].midi,
        // articulation is 1 if type="on" and 0 if type="hold"
        articulation: quantizedEventList[0].type === state.noteType.NOTE_ON ? 1 : 0,
      };
    } else {
      args.midi = 0;
      args.articulation = 1;
    }
    if (args.midi === 0) {
      if (state.lastHumanQuantizedNote.midi === 0) {
        state.lastHumanQuantizedNote.dur += 1;
      } else {
        state.lastHumanQuantizedNote.midi = args.midi;
        // state.lastHumanQuantizedNote.cpc = args.cpc;
        // state.lastHumanQuantizedNote.name = args.name;
        state.lastHumanQuantizedNote.dur = 1;
        state.lastHumanQuantizedNote.startTick = getters.getGlobalTickDelayed;
        // console.log("mesa")
      }
    } else {
      if (args.articulation == 1) {
        state.lastHumanQuantizedNote.midi = args.midi;
        // state.lastHumanQuantizedNote.cpc = args.cpc;
        // state.lastHumanQuantizedNote.name = args.name;
        state.lastHumanQuantizedNote.dur = 1;
        state.lastHumanQuantizedNote.startTick = getters.getGlobalTickDelayed;
      } else {
        // it should always be
        // console.assert(args.midi === state.lastHumanQuantizedNote.midi)
        state.lastHumanQuantizedNote.dur += 1;
      }
    }
  },

  /*
        Here the behaviors are defined.
        When a note is "on", turn on pianoState and bufferState for that note, then set the last note played to that note.
        When a note is "off", turn off pianoState
    */
  noteOn({commit, state, getters}, midiEvent) {
    state.pianoState[midiEvent.midi].status = true;
    state.pianoState[midiEvent.midi].timestamp = midiEvent.createdAt.seconds;

    state.noteOnBuffer.push(midiEvent);
    state.midiEventBuffer.push(midiEvent);
    state.lastEvent = midiEvent;
    state.lastEventTick = getters.getGlobalTickDelayed;
    state.lastNoteOnEvent = midiEvent;
    state.lastNoteOnEventTick = getters.getGlobalTickDelayed;
  },
  noteOff({commit, state, getters}, midiEvent) {
    state.pianoState[midiEvent.midi].status = false;
    state.pianoState[midiEvent.midi].timestamp = midiEvent.createdAt.seconds;

    state.midiEventBuffer.push(midiEvent);
    state.noteOffBuffer.push(midiEvent);
    state.lastEvent = midiEvent;
    state.lastEventTick = getters.getGlobalTickDelayed;
    state.lastNoteOffEvent = midiEvent;
    state.lastNoteOffEventTick = getters.getGlobalTickDelayed;
  },
};

const mutations = {
  // initPianoState (state) {
  //     // Create a range of midi numbers from 21 to 108 (piano keys)
  //     state.pianoMidiNumbers = [...Array(88).keys()].map(i => i + 21);
  //     state.pianoState = state.pianoMidiNumbers.reduce((map, midi) => {
  //         map[midi] = {status: false, timestamp: 0};
  //         return map
  //     }, {});
  // },

  setNoteType(state, noteType) {
    state.noteType = noteType;
    console.log(state.noteType);
  },
  initQuantBuffers(state, config) {
    const restNote = {
      midi: 128,
      chroma: 12,
      name: 'R',
      type: state.noteType.REST,
    };
    const ticksPerMeasure = config.clockSettings.ticksPerBeat * config.clockSettings.timeSignature.numerator;
    // initialize quantizedBufferAgent and quantizedBufferHuman with 16 restNotes
    state.quantizedBufferAgent =new Array(ticksPerMeasure).fill(restNote);
    state.quantizedBufferHuman =new Array(ticksPerMeasure).fill(restNote);
  },
  clearContinuousBuffers(state) {
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
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
