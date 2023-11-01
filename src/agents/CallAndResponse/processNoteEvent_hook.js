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
 */
export function processNoteEvent(noteEvent) {
    self.lastUserTimestamp = performance.now();
    self.userNotesList.push(noteEvent);
}


