import { clamp } from './../../../src/utils/math.js';
import { NoteEvent } from './../../../src/utils/NoteEvent.js'

const BAR =  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,-1];
const BEAT = [0,-2,-1,-2, 0,-2,-1,-2, 0,-2,-1,-2, 0,-2,-1,-2];
const ACCENT =[0,-3,-2,-3,-2,-4,-3,-4,-1,-3,-2,-3,-2,-4,-3,-4];

function euterpeTickToBachDuetTick(tick){
    let rhythmToken =   BAR[tick].toString() + '_' + 
                        BEAT[tick].toString() + '_' + 
                        ACCENT[tick].toString();
    return self.tokenIndexDict.rhythm.token2index[rhythmToken];
}

function euterpeNoteToBachDuetNote(noteEvent){
    let artic;
    if (noteEvent.type == self.noteType.NOTE_HOLD) 
        artic = 0;
    else if (noteEvent.type == self.noteType.NOTE_ON) 
        artic = 1;
    let midi = clamp(noteEvent.midi, 28, 94);
    let midiArtic = midi.toString() + '_' + artic.toString();
    let midiArticInd = self.tokenIndexDict.midiArtic.token2index[midiArtic];
    return {midi: midi, 
            artic: artic, 
            midiArticInd: midiArticInd,
            cpc: noteEvent.midi % 12};
}

function bachDuetNoteToEuterpeNote (bachDuetNote){
    let noteList = [];
    if (bachDuetNote.artic == 1) {
        // BachDuet generated a new note_on event
        // so we first need to send a note_off event for the previous note
        // unless the previous note was a rest.
        if (self.lastBachDuetNote.midi != 0) {
            let prevNoteOff = new NoteEvent();
            prevNoteOff.player = self.playerType.AGENT;
            prevNoteOff.instrument = self.instrumentType.PIANO;
            prevNoteOff.type = self.noteType.NOTE_OFF;
            prevNoteOff.midi = self.lastBachDuetNote.midi;
            prevNoteOff.velocity = 127;
            prevNoteOff.playAfter = {
                tick: 0,
                seconds: 0,
            }
            noteList.push(prevNoteOff);
        }

        if (bachDuetNote.midi != 0) {
            // Now we create the new note_on event
            let newNoteOn = new NoteEvent();
            newNoteOn.player = self.playerType.AGENT;
            newNoteOn.instrument = self.instrumentType.PIANO;
            newNoteOn.type = self.noteType.NOTE_ON;
            newNoteOn.midi = bachDuetNote.midi;
            newNoteOn.velocity = 127;
            newNoteOn.playAfter = {
                tick: 0,
                seconds: 0,
            }
            noteList.push(newNoteOn);
        }
    } else if (bachDuetNote.artic == 0) {
        // check if the last note had the same midi.
        // if yes, then we have a continuation don't send anything back to Euterpe
        // if no, then BachDuet made a mistake and generated a 'hold' version
        // of the note without previously generating a 'note on' version.
        // In this case we send a 'note on' event to Euterpe
        if (self.lastBachDuetNote.midi != bachDuetNote.midi) {

            let prevNoteOff = new NoteEvent();
            prevNoteOff.player = self.playerType.AGENT;
            prevNoteOff.instrument = self.instrumentType.PIANO;
            prevNoteOff.type = self.noteType.NOTE_OFF;
            prevNoteOff.midi = self.lastBachDuetNote.midi;
            prevNoteOff.velocity = 127;
            prevNoteOff.playAfter = {
                tick: 0,
                seconds: 0,
            }
            noteList.push(prevNoteOff);
            console.log("midi OFF (inhold)", prevNoteOff.midi);

            let newNoteOn = new NoteEvent();
            newNoteOn.player = self.playerType.AGENT;
            newNoteOn.instrument = self.instrumentType.PIANO;
            newNoteOn.type = self.noteType.NOTE_ON;
            newNoteOn.midi = bachDuetNote.midi;
            newNoteOn.velocity = 127;
            newNoteOn.playAfter = {
                tick: 0,
                seconds: 0,
            }
            noteList.push(newNoteOn);
            console.log("midi ON (inhold) ", bachDuetNote.midi);
        }
    }
    return noteList;

}

function bachDuetInference(midiInput_t, cpcInput_t, rhythmInput_t){
    
    let exodos = self.modelEmb.predict([midiInput_t, cpcInput_t, rhythmInput_t]);
    let embMidi = exodos[0];
    let embCpc = exodos[1];
    let embRhy = exodos[2];
    let embMidiC = tf.concat([embMidi.slice([0,0,0],[1,1,150]),embMidi.slice([0,1,0],[1,1,150])], 2);
    let embCpcC = tf.concat([embCpc.slice([0,0,0],[1,1,150]),embCpc.slice([0,1,0],[1,1,150])], 2);
    let totalInp = tf.concat([embMidiC, embCpcC, embRhy],2);
    let out = self.modelLstm.predict([totalInp, self.states1A, self.states1B, self.states2A, self.states2B]);
    self.states1A = out[1];
    self.states1B = out[2];
    self.states2A = out[3];
    self.states2B = out[4];
    let logits = out[0]
    let logits_temp = logits.div(self.temperature/100);
    let predictedNote = tf.multinomial(logits_temp, 2);
    let midiArticInd = predictedNote.dataSync()[0];
    let midiArtic = self.tokenIndexDict.midiArtic.index2token[midiArticInd];
    let midi = parseInt(midiArtic.split("_")[0]);
    let artic = parseInt(midiArtic.split("_")[1]);
    let cpc = (midi === 0) ? 12 : midi % 12;
    return {midi: midi, 
            artic: artic, 
            cpc: cpc, 
            midiArticInd: midiArticInd
        };
}

function resetBachDuetState(){
    console.log("reseting state");
    self.states1A = tf.zeros([1,600]);
    self.states1B = tf.zeros([1,600]);
    self.states2A = tf.zeros([1,600]);
    self.states2B = tf.zeros([1,600]);
}

export {euterpeTickToBachDuetTick,
        euterpeNoteToBachDuetNote,
        bachDuetNoteToEuterpeNote,
        bachDuetInference,
        resetBachDuetState}