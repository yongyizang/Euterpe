/*
    Hook for processing single user note events.
    This hook is invoked every time a note/midi event
    is received by the user.

    For this hook to be invoked, make sure that in config.yaml
    the following flags are set to true:
        interactionMode.noteMode : true
        nodeModeSettings.gridBased.status: true
*/
function processNoteEvent(noteEvent){
    // Put your code here

    /* 
    At this stage, the worker has finished processing the note event
    If there is some output that needs to be sent to the UI
    e.g a list of notes to be played, you can send here.
    Contrary to the processClockEvent() hook, you don't need to
    always postMessage to the UI. You can do it only when you have
    something to send.
    */
    postMessage({
        hookType: self.agentHookType.NOTE_EVENT, // Do not modify
        message:{
            // add your messages here
            // For example:
            // [self.messageType.NOTE_LIST]: noteList,
        }
    });
}