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
    
    // This should be the first line in your processClockEvent() hook
    // Do not remove it, as it is used to keep track of the agent's
    // inference time, and to calculate the maximum supported BPM
    let startTime = performance.now(); // Do not remove



    // Put your code here


    
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
            
        },
    })
}

export {processClockEvent};