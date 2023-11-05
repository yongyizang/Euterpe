import {average1d, max1d} from '@/utils/math.js';

import { NoteEvent } from '../../../src/utils/NoteEvent.js';

export const NOTE_PITCHES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', "A", "A#", "B"];
const CHORD_TYPES = {
    'maj' : [0, 4, 7],
    'min' : [0, 3, 7],
    'maj7' : [0, 4, 7, 11],
    '7' : [0, 4, 7, 10],
    'min7' : [0, 3, 7, 10]
}
const BASE_C = 36;
const BOSA = {
    'chord' : [1,0,1,0,0,1,0,1,0,1,0,1,0,0,1,0],
    'root' :  [1,0,0,1,1,0,0,0,1,0,0,0,1,0,0,0],
    'duration' : [1,0,3,0,0,1,0,1,0,1,0,0,1,0,1,0],
}

export class RunningHistogram {
    constructor(numBins, decayFactor) {
      this.numBins = numBins;
      this.hist = new Array(numBins).fill(0);
      this.decayFactor = decayFactor || 0.9; // Adjust this value as needed
    }
  
    process(value) {
      // Update the histogram with the new value
      this.hist = this.hist.map((bin) => bin * this.decayFactor);
      this.hist[value] += 1.0;
    }
  
    getHistogram() {
      // Normalize the histogram
      const sum = this.hist.reduce((acc, bin) => acc + bin, 0);
      return this.hist.map((bin) => bin / sum);
    }
}

export function getChord(pitchHistogram){
    
    let maxScore = 0;
    let matchedChord =  {
        root: null,
        type: null,
        pitches: null,
    }
    
    for (const rootNote in self.chordDict) {
        for (const chordType in self.chordDict[rootNote]) {
            let score = self.chordDict[rootNote][chordType]
                .reduce((acc, val, idx) => acc + val * pitchHistogram[idx], 0);
            if (score > maxScore) {
                maxScore = score;
                matchedChord.root = rootNote;
                matchedChord.type = chordType;
                matchedChord.pitches = self.chordDict[rootNote][chordType]
                    .map((val, idx) => val > 0 ? idx : -1).filter(val => val != -1);
            }
        }
    }
    console.log(maxScore);
    return matchedChord;

}

export function chromaToPitch(chroma) {
    let [maxChromaValue, maxChromaIndex] = max1d(chroma);
    let averageChromaValue = average1d(chroma);
    // console.log(maxChromaValue / averageChromaValue);
    self.param_writer.enqueue_change(1, maxChromaValue / averageChromaValue)
    if (maxChromaValue > 4 * averageChromaValue) {
        return maxChromaIndex;
    }
}

export function chordToNoteEvents(tick, chord) {
    if (chord){
        // if (tick % 8 == 0) {
        let chordNoteIndices = [];
        let rootNoteInd = NOTE_PITCHES.indexOf(chord.root);
        if (BOSA['root'][tick] == 1) {
            chordNoteIndices.push(rootNoteInd)
            // Convert the chord to a list of NoteEvents
        }
        if (BOSA['chord'][tick] == 1) {
            chordNoteIndices = [...chordNoteIndices, ...CHORD_TYPES[chord.type].slice(1).map((pitch) => (pitch + rootNoteInd))];
        }
        let noteEvents = chordNoteIndices.map((pitch, i) => {
            // let tickDelay = 0;//(i === 0) ? 0 : 4;
            const chordNote = new NoteEvent();
            chordNote.player = self.playerType.AGENT;
            chordNote.instrument = self.instrumentType.PIANO;
            chordNote.type = self.noteType.NOTE_ON;
            chordNote.midi = BASE_C + pitch;
            chordNote.velocity = 127
            chordNote.playAfter = {
                tick: 0,
                seconds: 0,
            }
            chordNote.duration = {
                tick: 1,
                seconds: 0,
            }
            return chordNote;
        });
        return noteEvents;
    }
}