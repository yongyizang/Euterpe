/*
    Hook for processing single user note events.
    This hook is invoked every time a note/midi event
    is received by the user.

    For this hook to be invoked, make sure that in config.yaml
    the following flags are set to true:
        interactionMode.noteMode : true
        nodeModeSettings.gridBased.status: true
*/
import {NoteEvent } from './../../utils_module.js';

// Local variable to this hook
let lastMidi = null;

// Create a mapping for the pianoGenie buttons
// Use the midi numbers of 60, 62, 64, 65, 67, 69, 71, 72
// to map to the buttons 0, 1, 2, 3, 4, 5, 6, 7
let buttonMap = {
    60: 0,
    62: 1,
    64: 2,
    65: 3,
    67: 4,
    69: 5,
    71: 6,
    72: 7
}

function processNoteEvent(noteEvent){
    // Put your code here
    let noteList = []
    if (noteEvent.type == self.noteType.NOTE_ON){
        // Check if midi is in the buttonMap
        console.log("noteEvent.midi is ", noteEvent.midi, noteEvent.midi in buttonMap);
        if (noteEvent.midi in buttonMap){
            let button = buttonMap[noteEvent.midi];
            let outputMidi = noteEvent.midi;
            let start = performance.now()
            // bypass is 0 or 1
            if (self.bypass == 0) {
                outputMidi = self.genie.nextFromKeyList(button, self.keyWhitelist, self.temperature/100) + 21;
            } 
            
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