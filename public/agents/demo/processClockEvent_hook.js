import {NoteEvent } from './../../../src/utils/NoteEvent.js';
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
 * @returns {Object=} - An optional object containing results to be sent to the UI.
 *  For example, you can send a list of notes to be played using the 
 * `NOTE_LIST` message type. 
 */
let lastNote = null;
let prevStartTime = performance.now();
export function processClockEvent(content) {
    
    let startTime = performance.now();
    let timeDiff = startTime - prevStartTime;
    prevStartTime = startTime;

    let quantizedEvents = content.humanQuantizedInput; 
    let noteList = [];

    // filter the notes with note.type === self.noteType.NOTE_ON
    let noteOnEvents = quantizedEvents.filter(note => note.type === self.noteType.NOTE_ON);
    let noteHoldEvents = quantizedEvents.filter(note => note.type === self.noteType.NOTE_HOLD);
    if (noteOnEvents.length > 0){
        if (lastNote) {
            // create a note off event
            let noteOffResponse = new NoteEvent();
            noteOffResponse.player = self.playerType.AGENT;
            noteOffResponse.instrument = self.instrumentType.PIANO;
            noteOffResponse.type = self.noteType.NOTE_OFF;
            noteOffResponse.midi = lastNote.midi;
            noteOffResponse.velocity = lastNote.velocity;
            noteOffResponse.playAfter = {
                tick: 8,
                seconds: 0 ,
            };
            noteList.push(noteOffResponse);
            lastNote = null;
        }

        let currentNote = noteOnEvents[0];
        let noteOnResponse = new NoteEvent();
        noteOnResponse.player = self.playerType.AGENT;
        noteOnResponse.instrument = self.instrumentType.PIANO;
        noteOnResponse.type = currentNote.type;
        noteOnResponse.midi = currentNote.midi - 12;
        noteOnResponse.velocity = currentNote.velocity;
        noteOnResponse.playAfter = {
            tick: 8,
            seconds: 0 ,
        },
        noteList.push(noteOnResponse);
        lastNote = noteOnResponse;
        console.log("agent generated note: " + noteOnResponse.midi);
    } else if (noteOnEvents.length === 0 && noteHoldEvents.length > 0){
        if (lastNote) {
            // console.log(noteHoldEvents[0].midi, " ", lastNote.midi);
            if (lastNote.midi + 12 !== noteHoldEvents[0].midi){
                // create a note off event
                let noteOffResponse = new NoteEvent();
                noteOffResponse.player = self.playerType.AGENT;
                noteOffResponse.instrument = self.instrumentType.PIANO;
                noteOffResponse.type = self.noteType.NOTE_OFF;
                noteOffResponse.midi = lastNote.midi;
                noteOffResponse.velocity = lastNote.velocity;
                noteOffResponse.playAfter = {
                    tick: 8,
                    seconds: 0 ,
                };
                noteList.push(noteOffResponse);
                lastNote = null; 
            }
        }
    } else if (noteOnEvents.length === 0 && noteHoldEvents.length === 0){
        if (lastNote) {
            // create a note off event
            let noteOffResponse = new NoteEvent();
            noteOffResponse.player = self.playerType.AGENT;
            noteOffResponse.instrument = self.instrumentType.PIANO;
            noteOffResponse.type = self.noteType.NOTE_OFF;
            noteOffResponse.midi = lastNote.midi;
            noteOffResponse.velocity = lastNote.velocity;
            noteOffResponse.playAfter = {
                tick: 8,
                seconds: 0 ,
            };
            noteList.push(noteOffResponse);
            lastNote = null;
        }
    }
    

    let actualPeriod = timeDiff;
    let actualBPM = 60 / (actualPeriod / 1000) / self.config.clockSettings.ticksPerBeat;
    // let error = actualBPM - 100;//self.config.clockSettings.tempo;
    console.log(actualBPM);
    self.param_writer.enqueue_change(3, actualBPM);
    // self.param_writer.enqueue_change(4, error);
    // console.log("agentWorker: " + Math.round(currentBPM) + " error: " + error);

    /*
    At this stage, the agent has finished processing the clock event
    and may send results to the UI. We can send a list of notes to be 
    played using the `NOTE_LIST` message type.
    e.g.:
    return {
        [self.messageType.NOTE_LIST]: agentOutputNoteList
    }
    */
    let message = {
        // [self.messageType.CHROMA_VECTOR]: tickAverageChroma,
        [self.messageType.NOTE_LIST]: noteList,
        [self.messageType.LABEL]: "Dm7"
    }
    return message;
}