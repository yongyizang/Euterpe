/*
    A hook for processing note/MIDI events from the user.

    For this hook to be invoked, make sure that in config.yaml
    the following flags are set to true:
        interactionMode.noteMode : true
        nodeModeSettings.gridBased.status: true

    This hook is invoked in sync with the clock, and provides
        1) a buffer with all the raw events since the last clock tick
            For this buffer to be provided set the following in config.yaml
                noteModeSettings.gridBased.eventBuffer: true

        2) a list of all the time-quantized events for the current tick
            For this buffer to be provided set the following in config.yaml
                noteModeSettings.gridBased.quantizedEvents: true
                
    The time spent in this hook should be less than the time between
    two clock ticks. 

    If audioMode is active, besides the note/MIDI events, you can also 
    process the available audio_features and audio_frames that are 
    created by the processAudioBuffer() hook.
*/
function processClockEvent(content) {
    
    let startTime = performance.now();
    let timeDiff = startTime - prevStartTime;
    prevStartTime = startTime;

    const currentTick = content.tick; 
    const quantizedEvents = content.humanQuantizedInput;  
    // console.log(quantizedEvents);
    let noteList = [];
    if (quantizedEvents.length > 0){
        let testNote = NoteEvent.fromPlain(quantizedEvents[0]);
        let arp_note = new NoteEvent();
        arp_note.player = self.playerType.AGENT;
        // The instrument is required for playback
        arp_note.instrument = self.instrumentType.PIANO;
        // The type of the note is the same as the user's input (note on)
        arp_note.type = testNote.type;
        // The midi note number is calculated by adding the arpeggio interval
        arp_note.midi = testNote.midi - 12;
        // The velocity is the same as the user's input
        arp_note.velocity = testNote.velocity;
        // Every note of the arpegio is played with a delay
        // of 0.1 seconds from the previous note.
        arp_note.playAfter = {
            tick: 7,
            seconds: 0 ,
        },
        // And has duration of 0.1 seconds
        arp_note.duration = {
            tick: 0,
            seconds: 0.6,
        }
        noteList.push(arp_note);
        console.log("agent generated note: " + arp_note.midi);
    }
    

    let actualPeriod = timeDiff;
    let actualBPM = 60 / (actualPeriod / 1000) / self.config.clockSettings.ticksPerBeat;
    let error = actualBPM - 100;//self.config.clockSettings.tempo;
    self._param_writer.enqueue_change(3, actualBPM);
    // self._param_writer.enqueue_change(4, error);
    // console.log("agentWorker: " + Math.round(currentBPM) + " error: " + error);

    


    /*
    At this stage, the worker has finished processing the clock event
    and sends the results to the UI. Since we estimated a chroma vector
    for the current tick, we'll send using the CHROMA_VECTOR message type.
    We can send a list of notes to be played using the NOTE_LIST message type.
    Finally, when in processClockEvent() hook,
    you should always send a CLOCK_TIME and INFERENCE_TIME message types, 
    so that the main thread can check whether the worker is in sync with the clock.
    */
    let endTime = performance.now(); // Do not remove
    postMessage({
        hookType: self.agentHookType.CLOCK_EVENT, // Do not modify
        message:{
            [self.messageType.CLOCK_TIME]: content.tick, // Do not modify
            [self.messageType.INFERENCE_TIME]: endTime - startTime, // Do not modify
            // Add your messages here
            // [self.messageType.CHROMA_VECTOR]: tickAverageChroma,
            [self.messageType.NOTE_LIST]: noteList,
        },
    })
}