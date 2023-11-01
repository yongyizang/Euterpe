/**
 * A hook for processing note/MIDI events from the user.
 *
 * For this hook to be invoked, make sure that in `config.yaml`,
 * the following flags are set to true:
 * - `interactionMode.noteMode: true`
 * - `nodeModeSettings.gridBased.status: true`
 *
 * This hook is invoked in sync with the clock, and provides:
 * 1) a list with all the raw NoteEvents since the last clock tick.
 *    For this list to be provided, set the following in `config.yaml`:
 *    - `noteModeSettings.gridBased.eventBuffer: true`
 *
 * 2) a list of all the time-quantized events for the current tick.
 *    For this buffer to be provided, set the following in `config.yaml`:
 *    - `noteModeSettings.gridBased.quantizedEvents: true`
 *
 * The time spent in this hook should be less than the time between two clock ticks.
 * If not, you'll see a warning in the console and in the UI.
 *
 * @param {object} content - content is an object that contains the following:
 * 1) (optional) a list with all the raw NoteEvents since the last clock tick.
 *    For this list to be provided, set the following in `config.yaml`:
 *    - `noteModeSettings.gridBased.eventBuffer: true`
 *
 * 2) (optional) a list of all the time-quantized events for the current tick.
 *    For this buffer to be provided, set the following in `config.yaml`:
 *    - `noteModeSettings.gridBased.quantizedEvents: true`
 * 3) the current clock tick number
 *
 * @return {Object} - An optional object containing results to be sent to the UI.
 *  For example, you can send a list of notes to be played using the
 * `NOTE_LIST` message type.
 */
export function processClockEvent(content) {
    if (self.lastUserTimestamp == null) {
        return;
    }
    // If more than 2 seconds have passed since the last user note,
    // then keep adding the notes to the list and return
    if (performance.now() - self.lastUserTimestamp > 1500) {
        if (self.userNotesList.length === 0) {
            return;
        }
        if (performance.now() < self.lastResponseEnd) {
            console.warn('waiting for the previous response to finish');
            return;
        }
        const responseNoteList = [];
        // get the timestamp of the first user note
        const firstUserTimestamp = self.userNotesList[0].createdAt.seconds;
        const lastUserTimestamp =
            self.userNotesList[self.userNotesList.length - 1].createdAt.seconds;
        const responseDuration = lastUserTimestamp - firstUserTimestamp;
        self.lastResponseEnd = performance.now() + responseDuration;
        // now we iterate over the list of user notes (call) and process them
        // to create the agent's response.
        // 1. set the playAfter.seconds property of each note to be the difference
        //      between the note's timestamp and the first user note's timestamp
        // 2. set the player property of each note to be the agent
        // 3. set the instrument property of each note to be the piano
        for (const userNote of self.userNotesList) {
            userNote.playAfter.seconds = (userNote.createdAt.seconds - firstUserTimestamp)/1000;
            userNote.playAfter.ticks = 0;
            userNote.player = self.playerType.AGENT;
            userNote.instrument = self.instrumentType.PIANO;
            let newMidi;
            if (userNote.type == self.noteType.NOTE_ON) {
                newMidi = userNote.midi +
                        self.pitchShift +
                        Math.floor(Math.random() * self.randomness);
                self.userToAgentNoteMapping[userNote.midi] = [newMidi];
                userNote.midi = newMidi;
            } else if (userNote.type == self.noteType.NOTE_OFF) {
                newMidi = self.userToAgentNoteMapping[userNote.midi][0];
                userNote.midi = newMidi;
            }
            responseNoteList.push(userNote);
        }
        const message = {};
        message[self.messageType.NOTE_LIST] = responseNoteList;
        self.userNotesList = [];
        return message;
    }
}
