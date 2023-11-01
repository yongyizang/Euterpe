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
    // Put your code here
    const agentOutputNoteList = [];

    /*
    At this stage, the agent has finished processing the clock event
    and may send results to the UI. We can send a list of notes to be
    played using the `NOTE_LIST` message type.
    e.g.:
    */
    return {
        [self.messageType.NOTE_LIST]: agentOutputNoteList,
    };
}
