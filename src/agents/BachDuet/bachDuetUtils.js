import {clampMidi} from '@/utils/math.js';
import {NoteEvent} from '@/utils/NoteEvent.js';

const BAR = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1];
const BEAT = [0, -2, -1, -2, 0, -2, -1, -2, 0, -2, -1, -2, 0, -2, -1, -2];
const ACCENT =[0, -3, -2, -3, -2, -4, -3, -4, -1, -3, -2, -3, -2, -4, -3, -4];


function createNote(midi, type) {
    const noteOn = new NoteEvent();
    noteOn.player = self.playerType.AGENT;
    noteOn.instrument = self.instrumentType.PIANO;
    noteOn.type = type;
    noteOn.midi = midi;
    noteOn.velocity = 127;
    // Play it instantly
    noteOn.playAfter = {
        tick: 1,
        seconds: 0,
    };
    return noteOn;
}

/**
 * Converts a tick from Euterpe to a tick in BachDuet.
 * @param {number} tick - The tick to convert.
 * @return {number} The converted tick.
 */
export function euterpeTickToBachDuetTick(tick) {
    const rhythmToken = BAR[tick].toString() + '_' +
                        BEAT[tick].toString() + '_' +
                        ACCENT[tick].toString();
    return self.tokenIndexDict.rhythm.token2index[rhythmToken];
}


/**
 * Converts a note from Euterpe to a note in BachDuet.
 * @param {NoteEvent} noteEvent - The note to convert.
 * @return {Object} The converted note.
 */
export function euterpeNoteToBachDuetNote(noteEvent) {
    let artic;
    if (noteEvent.type == self.noteType.NOTE_HOLD) {
        artic = 0;
    } else if (noteEvent.type == self.noteType.NOTE_ON) {
        artic = 1;
    }
    const midi = clampMidi(noteEvent.midi, 28, 94);
    const midiArtic = midi.toString() + '_' + artic.toString();
    const midiArticInd = self.tokenIndexDict.midiArtic.token2index[midiArtic];
    return {
        midi: midi,
        artic: artic,
        midiArticInd: midiArticInd,
        cpc: noteEvent.midi % 12,
    };
}

/**
 * Converts a note from BachDuet to a list of MICP NoteEvents.
 * @param {Object} bachDuetNote - The note to convert.
 * @return {NoteEvent} The converted note.
 */
export function bachDuetNoteToEuterpeNote(bachDuetNote) {
    const noteList = [];
    if (bachDuetNote.artic == 1) {
        // BachDuet generated a new note_on event
        // so we first need to send a note_off event for the previous note
        // unless the previous note was a rest.
        if (self.lastBachDuetNote.midi != 0) {
            noteList.push(createNote(self.lastBachDuetNote.midi, self.noteType.NOTE_OFF));
        }
        if (bachDuetNote.midi != 0) {
        // Now we create the new note_on event
            noteList.push(createNote(bachDuetNote.midi, self.noteType.NOTE_ON));
        }
    } else if (bachDuetNote.artic == 0) {
        // check if the last note had the same midi.
        // if yes, then we have a continuation don't send anything back to Euterpe
        // if no, then BachDuet made a mistake and generated a 'hold' version
        // of the note without previously generating a 'note on' version.
        // In this case we send a 'note on' event to Euterpe
        if (self.lastBachDuetNote.midi != bachDuetNote.midi) {
            if (self.lastBachDuetNote.midi != 0) {
                noteList.push(createNote(self.lastBachDuetNote.midi, self.noteType.NOTE_OFF));
            }
            noteList.push(createNote(bachDuetNote.midi, self.noteType.NOTE_ON));
        }
    }
    return noteList;
}

/**
 * The BachDuet neural network inference code
 * @param {Tensor2D} midiInputTensor
 * @param {Tensor2D} cpcInputTensor
 * @param {Tensor1D} rhythmInputTensor
 * @return {Object}
 */
export function bachDuetInference(midiInputTensor, cpcInputTensor, rhythmInputTensor) {
    const exodos = self.modelEmb.predict([midiInputTensor, cpcInputTensor, rhythmInputTensor]);
    const embMidi = exodos[0];
    const embCpc = exodos[1];
    const embRhy = exodos[2];
    const embMidiC = tf.concat([embMidi.slice([0, 0, 0], [1, 1, 150]),
        embMidi.slice([0, 1, 0], [1, 1, 150])], 2);
    const embCpcC = tf.concat([embCpc.slice([0, 0, 0], [1, 1, 150]),
        embCpc.slice([0, 1, 0], [1, 1, 150])], 2);
    const totalInp = tf.concat([embMidiC, embCpcC, embRhy], 2);
    const out = self.modelLstm.predict([totalInp,
        self.states1A, self.states1B, self.states2A, self.states2B]);
    self.states1A = out[1];
    self.states1B = out[2];
    self.states2A = out[3];
    self.states2B = out[4];
    const logits = out[0];
    const logitsTemp = logits.div(self.temperature/100);
    const predictedNote = tf.multinomial(logitsTemp, 2);
    const midiArticInd = predictedNote.dataSync()[0];
    const midiArtic = self.tokenIndexDict.midiArtic.index2token[midiArticInd];
    const midi = parseInt(midiArtic.split('_')[0]);
    const artic = parseInt(midiArtic.split('_')[1]);
    const cpc = (midi === 0) ? 12 : midi % 12;
    return {midi: midi,
        artic: artic,
        cpc: cpc,
        midiArticInd: midiArticInd,
    };
}

/**
 * Resets the BachDuet state
 */
export function resetBachDuetState() {
    console.log('reseting state');
    // self.states1A = tf.zeros([1,600]);
    // self.states1B = tf.zeros([1,600]);
    // self.states2A = tf.zeros([1,600]);
    // self.states2B = tf.zeros([1,600]);
    self.states1A = tf.randomNormal([1, 600]);
    self.states1B = tf.randomNormal([1, 600]);
    self.states2A = tf.randomNormal([1, 600]);
    self.states2B = tf.randomNormal([1, 600]);
}
