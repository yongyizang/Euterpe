import {average2d, shiftRight, average1d} from '@/utils/math.js';
import {RunningHistogram, getChord, 
        chordToNoteEvents, chromaToPitch,
        } from './utils.js';

const runningNoteHistogram = new RunningHistogram(12, 0.9);
let lastChord = null;

export function processClockEvent(content) {
    // Put your code here
    const message = {}

    if (lastChord) {
        message[self.messageType.TEXT] = lastChord.root + lastChord.type;
        let noteEvents = chordToNoteEvents(content.tick, lastChord);
        if (noteEvents){
            message[self.messageType.NOTE_LIST] = noteEvents;
        }
    }

    const features = self.audio_features_queue.toArrayAndClear();
    const chromaFrames = features.map((f) => f.chroma);
    const chromaVector = average2d(chromaFrames);
    // The chroma's we get from Meyda seem to be shifted by 1 left.
    // That's probably a bug in Meyda. We'll shift it back here.
    shiftRight(chromaVector);
    message[self.messageType.CHROMA_VECTOR] = runningNoteHistogram.getHistogram()

    let rmsFrames = features.map(f => f.rms);
    let rms = average1d(rmsFrames);


    if (rms < 0.01) {
        return message;
    }
    
    let currentPitch = chromaToPitch(chromaVector);
    if (currentPitch) {
        runningNoteHistogram.process(currentPitch);
        let userNoteHistogram = runningNoteHistogram.getHistogram();
        let chord = getChord(userNoteHistogram);
        lastChord = chord;
    }
    

    // message[self.messageType.CHROMA_VECTOR] = runningNoteHistogram.getHistogram()
    // message[self.messageType.CHROMA_VECTOR] = chromaVector;

    return message;
}
