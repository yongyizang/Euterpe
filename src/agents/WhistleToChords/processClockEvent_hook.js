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

    // self.audio_features_queue is initialized in initAgent_hook.js
    // and populated in processAudioEvent_hook.js
    const features = self.audio_features_queue.toArrayAndClear();
    // chromaFrames is a list of chroma vectors for each audio frame
    // since the last clock event (tick)
    const chromaFrames = features.map((f) => f.chroma);
    // chromaVector is the average chroma vector across all frames
    const chromaVector = average2d(chromaFrames);
    // The chroma's we get from Meyda seem to be shifted by 1 left.
    // We'll shift it back here so that 0-index = 'C'
    shiftRight(chromaVector);
    // Add your messages to Euterpe here using the VECTOR message type
    message[self.messageType.VECTOR] = runningNoteHistogram.getHistogram()

    let rmsFrames = features.map(f => f.rms);
    let rms = average1d(rmsFrames);

    if (rms < 0.01) {
        return message;
    }
    
    let currentPitch = chromaToPitch(chromaVector);
    console.log(currentPitch);
    if (currentPitch) {
        runningNoteHistogram.process(currentPitch);
        let userNoteHistogram = runningNoteHistogram.getHistogram();
        let chord = getChord(userNoteHistogram);
        lastChord = chord;
    }

    return message;
}
