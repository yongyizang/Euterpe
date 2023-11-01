import {NoteEvent} from '@/utils/NoteEvent.js';

export function createNote(midi, type) {
    const noteOn = new NoteEvent();
    noteOn.player = self.playerType.AGENT;
    noteOn.instrument = self.instrumentType.PIANO;
    noteOn.type = type;
    noteOn.midi = midi;
    noteOn.velocity = 127;
    // Play it instantly
    noteOn.playAfter = {
        tick: 0,
        seconds: 0,
    };
    return noteOn;
}

export function noteAlreadyActive(midiNote, pressedButton) {
    let matchFound = false
    for (const button in self.userToAgentNoteMapping) {
        if (self.userToAgentNoteMapping[button] === midiNote && button != pressedButton ) { //
            matchFound = true
        }
    }
    return matchFound;
}