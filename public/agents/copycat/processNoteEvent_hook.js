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


function processNoteEvent(noteEvent){
    // Euterpe expects a note list, even if it's a single note
    
    // if (noteEvent.type == self.noteType.NOTE_ON) {
    let noteList = [];
    // First we get the midi value of the note the user played
    let inputMidi = noteEvent.midi;
    // Then we estimate the midi the copycat will play
    let outputMidi = inputMidi - 12;
    
    // Set the range of outputMidi to be 21-108 (piano range)
    outputMidi = Math.max(21, Math.min(outputMidi, 108))

    // Set the text for the TextBox widget
    let label = outputMidi.toString();

    // Construct a new NoteEvent object
    let copycatNote = new NoteEvent();

    // The player is the agent
    copycatNote.player = self.playerType.AGENT;

    // The instrument is required for playback
    copycatNote.instrument = self.instrumentType.PIANO;

    // The type of the note is the same as the user's input (note_on or note_off)
    copycatNote.type = noteEvent.type;

    // The midi value is the one we estimated
    copycatNote.midi = outputMidi;

    // The velocity is the same as the user's input
    copycatNote.velocity = noteEvent.velocity;
    // Play it instantly
    copycatNote.playAfter = {
        tick: 0,
        seconds: 0,
    },

    // Push the note to the list of notes to be sent to the UI
    noteList.push(copycatNote);

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
            [self.messageType.LABEL]: label,
        }
    });
    }



// Very important, don't delete
export {processNoteEvent};