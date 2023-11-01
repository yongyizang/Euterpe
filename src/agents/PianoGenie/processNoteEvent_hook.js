import {NoteEvent} from '@/utils/NoteEvent.js';

// Local variable to this hook/file
let lastMidi = null;

// Create a mapping for the pianoGenie buttons
// Use the midi numbers of 60, 62, 64, 65, 67, 69, 71, 72
// to map to the buttons 0, 1, 2, 3, 4, 5, 6, 7
const buttonMap = {
    60: 0,
    62: 1,
    64: 2,
    65: 3,
    67: 4,
    69: 5,
    71: 6,
    72: 7,
};

/**
 * Hook for processing single user note events.
 * This hook is invoked every time a note/midi
 * event is received by the user.
 *
 * For this hook to be invoked, make sure that in `config.yaml`,
 * the following flags are set to true:
 * - `interactionMode.noteMode: true`
 * - `nodeModeSettings.gridBased.status: true`
 *
 * @param {NoteEvent} noteEvent - A `NoteEvent` object representing
 * the note/midi event received by the user.
 *
 * @return {Object} - An optional object containing output messages, if any,
 * to be sent to the user interface. If there is some output that needs to be
 * sent to the UI (e.g., a list of notes to be played), you can add it to a
 * dictionary and return it. If not, it's fine to not return anything.
 */
export function processNoteEvent(noteEvent) {
    // Put your code here
    const noteList = [];
    if (noteEvent.midi in buttonMap) {
        if (noteEvent.type == self.noteType.NOTE_ON) {
            // Check if midi is in the buttonMap
            const button = buttonMap[noteEvent.midi];
            let outputMidi = noteEvent.midi;
            const start = performance.now();
            // bypass is 0 or 1
            if (self.bypass == 0) {
                outputMidi = self.genie.nextFromKeyList(button, self.keyWhitelist,
                    self.temperature/100) + 21;
            }
            const inferenceTime = performance.now() - start;
            self.param_writer.enqueue_change(0, inferenceTime);
            lastMidi = outputMidi;
            // Create a new NoteObject and send it to the main thread
            // create the new note
            const noteOn = new NoteEvent();
            noteOn.player = self.playerType.AGENT;
            // The instrument is required for playback
            noteOn.instrument = self.instrumentType.PIANO;
            // The type of the note is the same as the user's input (note on)
            noteOn.type = noteEvent.type;
            noteOn.midi = outputMidi;
            // The velocity is the same as the user's input
            noteOn.velocity = noteEvent.velocity;
            // Play it instantly
            noteOn.playAfter = {
                tick: 0,
                seconds: 0,
            },
            // Push the note to the list of notes to be sent to the UI
            noteList.push(noteOn);
            // We store the mapping of the user's note to the agent's note
            // in the userToAgentNoteMapping dictionary (defined in agent.js)
            // Later, when we receive the note-off event, we can use this mapping
            // to know which note to turn off
            self.userToAgentNoteMapping[noteEvent.midi] = [lastMidi];
        } else {
            // Use the noteOffMemory to turn off the notes
            const midisToTurnOff = self.userToAgentNoteMapping[noteEvent.midi];
            for (const midiOff of midisToTurnOff) {
                const noteOff = new NoteEvent();
                noteOff.player = self.playerType.AGENT;
                // The instrument is required for playback
                noteOff.instrument = self.instrumentType.PIANO;
                // The type of the note is the same as the user's input (note on)
                noteOff.type = noteEvent.type;
                noteOff.midi = midiOff;
                // The velocity is the same as the user's input
                noteOff.velocity = noteEvent.velocity;
                // Play it instantly
                noteOff.playAfter = {
                    tick: 0,
                    seconds: 0,
                };
                noteList.push(noteOff);
            }
        }
    }
    /*
    At this stage, the worker has finished processing the note event
    If there is some output that needs to be sent to the UI
    e.g a list of notes to be played, you can send here.
    Contrary to the processClockEvent() hook, you don't need to
    always postMessage to the UI. You can do it only when you have
    something to send.
    */
    const message = {
        // add your messages here
        [self.messageType.NOTE_LIST]: noteList,
    };
    return message;
}
