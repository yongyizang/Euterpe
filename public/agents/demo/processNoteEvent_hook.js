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
    /* 
     * An example of a simple MIDI processor
     * take the user's input and create an arpeggio
     * the arpeggio should type depends on the state of switch1
     * and it is [3, 5, 8, 12] if switch is one
     * or [4, 7, 9, 12] if switch is zero
     
     */
    let arpeggio = [];
    if (self.switch1 == 0){
        arpeggio = [3, 5, 8, 12, 15];
    } else{
        arpeggio = [4, 7, 9, 12, 9, 7, 4];
    }

    let noteList = [];
    if (noteEvent.type == self.noteType.NOTE_ON){
        for (let i = 0; i < arpeggio.length; i++) {
            // create the new note
            let arp_note = new NoteEvent();
            arp_note.player = self.playerType.AGENT;
            // The instrument is required for playback
            arp_note.instrument = self.instrumentType.PIANO;
            // The type of the note is the same as the user's input (note on)
            arp_note.type = noteEvent.type;
            // The midi note number is calculated by adding the arpeggio interval
            arp_note.midi = noteEvent.midi + arpeggio[i];
            // The velocity is the same as the user's input
            arp_note.velocity = noteEvent.velocity;
            // Every note of the arpegio is played with a delay
            // of 0.1 seconds from the previous note.
            arp_note.playAfter = {
                tick: 0,
                seconds: (i+1)*0.1 ,
            },
            // And has duration of 0.1 seconds
            arp_note.duration = {
                tick: 0,
                seconds: 0.1,
            },
            // Push the note to the list of notes to be sent to the UI
            noteList.push(arp_note);
        }

        // Let's also create a label that will be displayed in the UIs TextBox
        let label = noteEvent.name;

        // Similar to the processClockEvent() hook, we send the results
        // to the UI. In this example we send a list of the arpeggio notes
        // we estimated for the user's input.
        // The main thread will display and play those notes according 
        // to the playAfter property of each note.
        postMessage({
            hookType: self.agentHookType.NOTE_EVENT,
            message:{
                [self.messageType.NOTE_LIST]: 
                        noteList,
                [self.messageType.LABEL]:
                        label
            }
        });
    }
}