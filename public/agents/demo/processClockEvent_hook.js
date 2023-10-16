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
    
    let features = self.audio_features_queue.toArrayAndClear()
    let chromas = features.map(f => f.chroma);
    let rms = features.map(f => f.rms);
    // self._param_writer.enqueue_change(5, chromas.length);

    let tickAverageChroma = null
    if (chromas.length == 0){
        // float array of zeros
        tickAverageChroma = new Float32Array(12);
    }
    else {
        tickAverageChroma = average2d(chromas);
        // The chroma's we get from Meyda seem to be shifted by 1 left. 
        // That's probably a bug in Meyda. We'll shift it back here.
        shiftRight(tickAverageChroma)
    }

    let actualPeriod = timeDiff;
    let actualBPM = 60 / (actualPeriod / 1000) / self.config.clockSettings.ticksPerBeat;
    let error = actualBPM - 100;//self.config.clockSettings.tempo;
    self._param_writer.enqueue_change(3, actualBPM);
    self._param_writer.enqueue_change(4, error);
    // console.log("agentWorker: " + Math.round(currentBPM) + " error: " + error);

    let noteList = [];
    let dividedBy2 = currentTick % 2 == 0;
    let dividedBy4 = currentTick % 4 == 0;
    let dividedBy8 = currentTick % 8 == 0;
    if (dividedBy2){
        const drumNote = new NoteEvent();
        drumNote.player = self.playerType.AGENT;
        drumNote.instrument = self.instrumentType.DRUMS;
        drumNote.type = self.noteType.NOTE_ON;
        drumNote.midi = 14; // That's required for playback
        drumNote.velocity = 110; // That's required for playback
        drumNote.createdAt = {
            tick: currentTick,
            seconds: performance.now()
        }
        // play the note 1 tick and 0 seconds after it was generated
        drumNote.playAfter = {
            tick: 0,
            seconds: 0
        }
        // The duration of the drumNote
        drumNote.duration = {
            tick: 0,
            seconds: 1
        }
        // Push the drumNote to the list of notes to be sent to the UI
        noteList.push(drumNote);
    }
    if (dividedBy4 & !dividedBy8){
        const drumNote = new NoteEvent();
        drumNote.player = self.playerType.AGENT;
        drumNote.instrument = self.instrumentType.DRUMS;
        drumNote.type = self.noteType.NOTE_ON;
        drumNote.midi = 13; // That's required for playback
        drumNote.velocity = 90; // That's required for playback
        drumNote.createdAt = {
            tick: currentTick,
            seconds: performance.now()
        }
        // play the note 1 tick and 0 seconds after it was generated
        drumNote.playAfter = {
            tick: 0,
            seconds: 0
        }
        // The duration of the drumNote
        drumNote.duration = {
            tick: 0,
            seconds: 1
        }
        // Push the drumNote to the list of notes to be sent to the UI
        noteList.push(drumNote);
    }
    // Generate a kick every second quarter note (on the 1st and 3rd beat)
    if (dividedBy8){
        const drumNote = new NoteEvent();
        drumNote.player = self.playerType.AGENT;
        drumNote.instrument = self.instrumentType.DRUMS;
        drumNote.type = self.noteType.NOTE_ON;
        drumNote.midi = 12; // That's required for playback
        drumNote.velocity = 127; // That's required for playback
        drumNote.createdAt = {
            tick: currentTick,
            seconds: performance.now()
        }
        // play the note 1 tick and 0 seconds after it was generated
        drumNote.playAfter = {
            tick: 0,
            seconds: 0
        }
        // The duration of the drumNote
        drumNote.duration = {
            tick: 0,
            seconds: 1
        }
        // Push the drumNote to the list of notes to be sent to the UI
        noteList.push(drumNote);
    }

    // estimate the inference time of your algorithm
    // the UI keeps track of this, and updates the 
    // maximum supported BPM (in settings)
    // use the parameter id for Inference Time in config_widgets.yaml
    // self._param_writer.enqueue_change(2, predictTime);

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
            [self.messageType.CHROMA_VECTOR]: tickAverageChroma,
            [self.messageType.NOTE_LIST]: noteList,
        },
    })
}