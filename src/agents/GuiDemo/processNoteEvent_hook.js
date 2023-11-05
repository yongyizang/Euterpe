// import {NoteEvent} from '@/utils/NoteEvent.js';

/**
 * Hook for processing single user note events.
 * This hook is invoked every time a note/midi
 * event is received by the user.
 *
 * For this hook to be invoked, make sure that in `config.yaml`,
 * the following flags are set to true:
 * - `interactionMode.noteMode: true`
 * - `nodeModeSettings.eventBased.status: true`
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

    /*
    At this stage, the worker has finished processing the note event.
    If there is some output that needs to be sent to the UI
    (e.g., a list of notes to be played), you can add it to a dictionary
    and return it. If not, it's fine to not return anything.
    e.g.:
    */
    return {
        // add your messages here
        [self.messageType.NOTE_LIST]: noteList,
    };
}
