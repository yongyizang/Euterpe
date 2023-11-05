import {NoteEvent} from '@/utils/NoteEvent.js';

// variables local to this file
let lastNote = null;
let prevStartTime = performance.now();

function createNote(midi, type) {
    const noteOn = new NoteEvent();
    noteOn.player = self.playerType.AGENT;
    noteOn.instrument = self.instrumentType.PIANO;
    noteOn.type = type;
    noteOn.midi = midi;
    noteOn.velocity = 127;
    // Play it instantly
    noteOn.playAfter = {
        tick: self.delay,
        seconds: 0,
    };
    return noteOn;
}

export function processClockEvent(content) {

    // Calculations for monitoring the true BPM
    const startTime = performance.now();
    const timeDiff = startTime - prevStartTime;
    prevStartTime = startTime;

    // Get the clock-aligned user note events from the content
    const quantizedEvents = content.userQuantizedNotes;
    const noteList = [];
    const message = {};

    // filter the notes with note.type === self.noteType.NOTE_ON
    const noteOnEvents = quantizedEvents.filter((note) => note.type === self.noteType.NOTE_ON);
    const noteHoldEvents = quantizedEvents.filter((note) => note.type === self.noteType.NOTE_HOLD);
    if (noteOnEvents.length > 0) {
        if (lastNote) {
            // This means there is alread a note on, so we need to turn it off
            // we do that to ensure our agent outputs a monophonic melody
            // which is necessary for the score visualization to work
            noteList.push(createNote(lastNote.midi, self.noteType.NOTE_OFF));
            lastNote = null;
        }
        const currentNote = noteOnEvents[0];
        let outputMidi = currentNote.midi + self.pitchShift + Math.floor(Math.random() * self.randomness);
        const noteOnResponse = createNote(outputMidi, self.noteType.NOTE_ON)
        noteList.push(noteOnResponse);
        // update the lastNote variable
        lastNote = noteOnResponse;
        // update the user-to-agent note mapping
        // we'll use that to turn off the note later
        self.userToAgentNoteMapping[currentNote.midi] = noteOnResponse.midi;
    } else if (noteOnEvents.length === 0 && noteHoldEvents.length === 0) {
        // If there is no note on or hold event, it means the user has 
        // released all the notes, so we need to turn off the last note
        if (lastNote) {
            // create a note off event
            noteList.push(createNote(lastNote.midi, self.noteType.NOTE_OFF));
            lastNote = null;
        }
    }

    // calculations for monitoring the true BPM
    const actualPeriod = timeDiff;
    const actualBPM = 60 / (actualPeriod / 1000) / self.config.clockSettings.ticksPerBeat;
    self.param_writer.enqueue_change(3, actualBPM);

    message[self.messageType.NOTE_LIST] = noteList;
    return message;
}
