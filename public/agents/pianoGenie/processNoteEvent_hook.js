/*
    Hook for processing single user note events.
    This hook is invoked every time a note/midi event
    is received by the user.

    For this hook to be invoked, make sure that in config.yaml
    the following flags are set to true:
        interactionMode.noteMode : true
        nodeModeSettings.gridBased.status: true
*/
import { LIFOQueue, FIFOQueue, deinterleave_custom, simulateBlockingOperation, shiftRight, average2d, NoteEvent } from './../../utils.js';
let lastMidi = null;
let keyWhitelist = Array(88).fill().map((x,i) => {
    return i;
});
function processNoteEvent(noteEvent){
    // Put your code here
    let noteList = []
    if (noteEvent.type == self.noteType.NOTE_ON){
        let button = noteEvent.midi - 60
        // console.log("button ", button, "temp ", temperature/100);

        let start = performance.now()
        const outputMidi = self.genie.nextFromKeyList(button, keyWhitelist, temperature/100) + 21;
        let inferenceTime = performance.now() - start;
        self._param_writer.enqueue_change(0, inferenceTime);
        lastMidi = outputMidi;
        // Create a new NoteObject and send it to the main thread
        // create the new note
        let arp_note = new NoteEvent();
        arp_note.player = self.playerType.AGENT;
        // The instrument is required for playback
        arp_note.instrument = self.instrumentType.PIANO;
        // The type of the note is the same as the user's input (note on)
        arp_note.type = noteEvent.type;
        arp_note.midi = outputMidi;
        // The velocity is the same as the user's input
        arp_note.velocity = noteEvent.velocity;
        // Play it instantly
        arp_note.playAfter = {
            tick: 0,
            seconds: 0 ,
        },
        arp_note.duration = {
            tick: 0,
            seconds: 0.5
        }
        // Push the note to the list of notes to be sent to the UI
        noteList.push(arp_note);
    } 
    else {
        // TODO
        // console.log("lastMidi was ", lastMidi);
    }

    /* 
    At this stage, the worker has finished processing the note event
    If there is some output that needs to be sent to the UI
    e.g a list of notes to be played, you can send here.
    Contrary to the processClockEvent() hook, you don't need to
    always postMessage to the UI. You can do it only when you have
    something to send.
    */
    // console.log("processNoteEvent", self.agentHookType);
    postMessage({
        hookType: self.agentHookType.NOTE_EVENT, // Do not modify
        message:{
            // add your messages here
            // For example:
            [self.messageType.NOTE_LIST]: noteList,
        }
    });
}

export {processNoteEvent};