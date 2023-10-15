<!--
    This is the vue component of Piano Keyboard UI.

    It automatically generates the correct amount of keys, with a default piano sampler.
-->

<template>
  <div class="keyboard" :style="style">
    <ul>
      <!--
        This is an iteration for every key on the keyboard.
        the reference of the key's name is "key.name"
        the CSS class of the key is "key.class", while the active state is defined by noteActive(key.name).
        For more information, please check the doc on Vue.js.
        -->
      <li
        v-for="(key, index) in keys"
        :key="index"
        :style="key.style"
        @mousedown="toggleAttack(key.name)"
        @mouseup="toggleRelease(key.name)"
        :class="[
          ...key.class,
          { active: noteActive(key.name) },
          { audiokeys: key.name in audioKeysMap },
        ]"
        :ref="key.name"
      >
        <p v-if="key.name in audioKeysMap" style="font-family: roboto;line-height:15px;margin-bottom:0px"><span style="font-size:20px;">{{ audioKeysMap[key.name] }}</span> <br /> <span style="opacity: 0.5;font-size:12px">{{ key.name }}</span></p>
        <span style="opacity: 0.3; font-family: roboto" v-else >{{ key.name }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import "../css/keyboard.css";

import * as Tone from "tone";
import { clamp } from "@/utils/math";
import {Note} from "@tonaljs/tonal";
import {
    playerType, instrumentType, eventSourceType,
    messageType, statusType, noteType,
    uiParameterType, workerParameterType,
    workerHookType
} from '@/utils/types.js'
import { NoteEvent } from '@/utils/NoteEvent.js'


// Here, a set of constants are defined.
const WHITE_KEYS = ["C", "D", "E", "F", "G", "A", "B"];
const BLACK_KEYS = ["C#", "D#", null, "F#", "G#", "A#", null];
const NOTE_OFFSETS = ["C", "D", "E", "F", "G", "A", "B"];
const NUM_WHITE_KEYS_PER_OCTAVE = 7;
const NUM_BLACK_KEYS_PER_OCTAVE = 5;
const NUM_WHITE_KEYS_TOTAL = 52;
const NUM_BLACK_KEYS_TOTAL = 36;
const MIN_OCTAVE = 0;
const MAX_OCTAVE = 8;
const MIN_NOTE = 0;
const MAX_NOTE = 6;

// Initialize the pianoSampler.

export default {
  name: "KeyboardComponent",

  props: {
    octaveStart: {
      type: Number,
      validator(value) {
        return value >= MIN_OCTAVE && value <= MAX_OCTAVE;
      },
      default() {
        return MIN_OCTAVE;
      },
    },

    octaveEnd: {
      type: Number,
      validator(value) {
        return value >= MIN_OCTAVE && value <= MAX_OCTAVE;
      },
      default() {
        return MAX_OCTAVE;
      },
    },

    noteStart: {
      type: [Number, String],
      validator(value) {
        if (typeof value === "string") {
          return WHITE_KEYS.includes(value);
        } else {
          return value >= MIN_NOTE && value <= MAX_NOTE;
        }
      },
      default() {
        return WHITE_KEYS.indexOf("A");
      },
    },

    noteEnd: {
      type: [Number, String],
      validator(value) {
        if (typeof value === "string") {
          return WHITE_KEYS.includes(value);
        } else {
          return value >= MIN_NOTE && value <= MAX_NOTE;
        }
      },
      default() {
        return WHITE_KEYS.indexOf("C");
      },
    },
  },

  created() {
    this.$root.$refs.keyboard = this;

    if (typeof this.noteStart === "string") {
      this.offsets.noteStart = WHITE_KEYS.indexOf(this.noteStart);
    } else {
      this.offsets.noteStart = this.noteStart;
    }

    if (typeof this.noteEnd === "string") {
      this.offsets.noteEnd = WHITE_KEYS.indexOf(this.noteEnd);
    } else {
      this.offsets.noteEnd = this.noteEnd;
    }

    this.offsets.octaveStart = this.octaveStart;
    this.offsets.octaveEnd = this.octaveEnd;

    if (
      this.offsets.octaveStart > this.offsets.octaveEnd ||
      (this.offsets.octaveStart === this.offsets.octaveEnd &&
        this.offsets.noteStart > this.offsets.noteEnd)
    ) {
      throw new Error(
        "The start octave must be lower than or equal to the end octave and the start note must be lower than the end note."
      );
    }
  },

  data() {
    return {
      offsets: {
        octaveStart: 0,
        octaveEnd: 3,
        noteStart: 0,
        noteEnd: 0,
      },
      lastNote: null,
      audioKeysMap: {
        C4: "Z",
        "C#4": "S",
        D4: "X",
        "D#4": "D",
        E4: "C",
        F4: "V",
        "F#4": "G",
        G4: "B",
        "G#4": "H",
        A4: "N",
        "A#4": "J",
        B4: "M",
        C5: "Q",
        "C#5": "2",
        D5: "W",
        "D#5": "3",
        E5: "E",
        F5: "R",
        "F#5": "5",
        G5: "T",
        "G#5": "6",
        A5: "Y",       
        "A#5": "7",
        B5: "U",     
        C6: "I",
        "C#6": "9",
        D6: "O",
        "D#6": "0",
        E6: "P",
        F6: "[",
        "F#6": "=",
        G6: "]",
      },
    };
  },

  methods: {
    noteActive(note) {
        // If the note is active, the state of that note is true.
        let midi = Note.midi(note);
        return this.$store.getters.getPianoState[midi].status === true;
    },

    toggleAttack(currentNote) {
        
        this.lastNote = currentNote;
        window.addEventListener('mouseup', this.toggleReleaseOffKeyboard);
        let noteName = currentNote;
        // get midi number from noteName
        let midi = Note.midi(noteName);

        const newNoteEvent = new NoteEvent();
        newNoteEvent.player = playerType.HUMAN;
        newNoteEvent.instrument = instrumentType.PIANO;
        newNoteEvent.source = eventSourceType.MOUSE;
        newNoteEvent.name = noteName;
        newNoteEvent.type = noteType.NOTE_ON;
        newNoteEvent.channel = 140; // this is channel midi channel 0
        newNoteEvent.midi = midi;
        newNoteEvent.velocity = 127;
        newNoteEvent.createdAt = {
            seconds: performance.now(),
            tick: this.$store.getters.getGlobalTickDelayed,
        };
        newNoteEvent.playAfter = {
            seconds: 0,
            tick: 0
        };
        newNoteEvent.duration = null;
        // TODO : a better way to do this is to emit the event to the parent
        this.$parent.processUserNoteEvent(newNoteEvent, true);
        

    },

    toggleReleaseOffKeyboard() {
        if (this.lastNote){
            this.toggleRelease(this.lastNote);
        }
        window.removeEventListener('mouseup', this.toggleReleaseOffKeyboard);
    },

    toggleRelease(currentNote) {
        if (this.lastNote != currentNote) {
            if (this.lastNote){
                this.toggleRelease(this.lastNote);
            }
            return;
        }
        console.log("releasing note ", currentNote);
        this.lastNote = null;
        let noteName = currentNote; // Midi.midiToNoteName(note.note, { sharps: true });
        // get midi number from noteName
        let midi = Note.midi(noteName);

        const newNoteEvent = new NoteEvent();
        newNoteEvent.player = playerType.HUMAN;
        newNoteEvent.instrument = instrumentType.PIANO;
        newNoteEvent.source = eventSourceType.MOUSE;
        newNoteEvent.name = noteName;
        newNoteEvent.type = noteType.NOTE_OFF;
        newNoteEvent.channel = 140; // this is channel midi channel 0
        newNoteEvent.midi = midi;
        newNoteEvent.velocity = 127;
        newNoteEvent.createdAt = {
            seconds: performance.now(),
            tick: this.$store.getters.getGlobalTickDelayed,
        };
        newNoteEvent.playAfter = {
            seconds: 0,
            tick: 0
        };
        newNoteEvent.duration = null;
        this.$parent.processUserNoteEvent(newNoteEvent, true);

    },

    calculateOctave(n) {
      return (
        Math.floor(n / NUM_WHITE_KEYS_PER_OCTAVE) +
        Math.max(MIN_OCTAVE, this.offsets.octaveStart)
      );
    },
  },

  computed: {
    offsetStart() {
      return clamp(this.offsets.noteStart, MIN_NOTE, MAX_NOTE);
    },

    offsetEnd() {
      return clamp(this.offsets.noteEnd, MIN_NOTE, MAX_NOTE);
    },

    totalWhiteKeys() {
      return Math.min(
        Infinity,
        this.numOctaves * NUM_WHITE_KEYS_PER_OCTAVE -
          this.offsetStart -
          (NUM_WHITE_KEYS_PER_OCTAVE - (this.offsetEnd + 1))
      );
    },

    totalBlackKeys() {
      return Math.min(
        Infinity,
        this.numOctaves * NUM_BLACK_KEYS_PER_OCTAVE -
          this.offsetStart -
          (NUM_BLACK_KEYS_PER_OCTAVE - (this.offsetEnd + 1))
      );
    },

    totalKeys() {
      return this.totalWhiteKeys + this.totalBlackKeys;
    },

    numOctaves() {
      return (
        1 +
        (Math.min(MAX_OCTAVE, this.offsets.octaveEnd) -
          Math.max(MIN_OCTAVE, this.offsets.octaveStart))
      );
    },

    style() {
      return {
        "--keys": this.totalWhiteKeys,
        "--octaves": this.numOctaves,
      };
    },

    keys() {
      const keys = [];

      // White keys.
      for (let i = this.offsetStart, j = 0; j < this.totalWhiteKeys; i++, j++) {
        const octave = this.calculateOctave(i);
        const keyName = WHITE_KEYS[i % 7];
        const key = {
          name: `${keyName}${octave}`,
          class: ["white", keyName, `${keyName}${octave}`],
          style: {
            "grid-column": `${j === 0 ? 1 : 4 + (j - 1) * 3} / span 3`,
          },
        };
        keys.push(key);
      }

      // Black keys.
      for (let i = this.offsetStart, j = 0; j < this.totalWhiteKeys; i++, j++) {
        const octave = this.calculateOctave(i);
        const keyName = BLACK_KEYS[i % 7];

        if (!keyName) {
          continue;
        }

        if (octave >= 8) {
          continue;
        }

        const keyNameClass = keyName.replace("#", "s");

        const key = {
          name: `${keyName}${octave}`,
          class: ["black", keyNameClass, `${keyNameClass}${octave}`],
          style: {
            "grid-column": `${j === 0 ? 3 : 6 + (j - 1) * 3} / span 2`,
          },
        };

        keys.push(key);
      }

      return keys;
    },
  },
};
</script>