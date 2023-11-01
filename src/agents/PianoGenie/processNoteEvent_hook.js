import { createNote, noteAlreadyActive } from './genieUtils.js';
// Create a mapping for the pianoGenie buttons
// Use the midi numbers of 60, 62, 64, 65, 67, 69, 71, 72
// to map to the buttons 0, 1, 2, 3, 4, 5, 6, 7
const BUTTON_MAP = {
    60: 0,
    62: 1,
    64: 2,
    65: 3,
    67: 4,
    69: 5,
    71: 6,
    72: 7,
};

export function processNoteEvent(noteEvent) {
    // TODO add comments
    const message = {};
    const noteList = [];
    if (noteEvent.midi in BUTTON_MAP) {
        const button = BUTTON_MAP[noteEvent.midi];
        if (noteEvent.type == self.noteType.NOTE_ON) {
            let outputMidi = noteEvent.midi;
            const start = performance.now();
            // bypass is 0 or 1
            if (self.bypass == 0) {
                outputMidi = self.genie.nextFromKeyList(button, self.keyWhitelist,
                    self.temperature/100) + 21;
            }
            const inferenceTime = performance.now() - start;
            self.param_writer.enqueue_change(0, inferenceTime);

            
            if (noteAlreadyActive(outputMidi, button)) {
                noteList.push(createNote(outputMidi, self.noteType.NOTE_OFF));
            }

            noteList.push(createNote(outputMidi, self.noteType.NOTE_ON))

            // We store the mapping of the user's note to the agent's note
            // in the userToAgentNoteMapping dictionary (defined in agent.js)
            // Later, when we receive the note-off event, we can use this mapping
            // to know which note to turn off
            self.userToAgentNoteMapping[button] = outputMidi;
        } else {
            // Use the userToAgentNoteMapping dict to find which midi note
            // corresponds to the released key and turn off the note
            const midiToTurnOff = self.userToAgentNoteMapping[button];
            if (!noteAlreadyActive(midiToTurnOff, button)) {
                noteList.push(createNote(midiToTurnOff, self.noteType.NOTE_OFF));
            }
            self.userToAgentNoteMapping[button] = null;
        }
    }

    message[self.messageType.NOTE_LIST] = noteList;
    return message;
}
