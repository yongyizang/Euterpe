import {NoteEvent } from './../../utils_module.js';
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
    let data = content.data;
    // console.log()
    console.log("temp ", self.temperature, "reset ", self.resetState);
    console.log("dict ", self.tokenIndexDict);

    // let midiInp = tf.tensor2d([[data['aiInp'].midiArticInd, data['humanInp'].midiArticInd]]);
    // let cpcInp = tf.tensor2d([[data['aiInp'].cpc, data['humanInp'].cpc]]); 
    // let rhyInp = tf.tensor2d([[data['rhythmInd']]]);

    // let exodos = self.modelEmb.predict([midiInp, cpcInp, rhyInp]);
    // let embMidi = exodos[0];
    // let embCpc = exodos[1];
    // let embRhy = exodos[2];
    // let embMidiC = tf.concat([embMidi.slice([0,0,0],[1,1,150]),embMidi.slice([0,1,0],[1,1,150])], 2);
    // let embCpcC = tf.concat([embCpc.slice([0,0,0],[1,1,150]),embCpc.slice([0,1,0],[1,1,150])], 2);
    // let totalInp = tf.concat([embMidiC, embCpcC, embRhy],2);

    // let predictTime = performance.now();
    // let out = self.modelLstm.predict([totalInp, self.states1A, self.states1B, self.states2A, self.states2B]);
    // predictTime = performance.now() - predictTime;
    // postMessage({'predictTime': predictTime});

    // self.states1A = out[1];
    // self.states1B = out[2];
    // self.states2A = out[3];
    // self.states2B = out[4];
    
    // let logits = out[0]
    
    // let logits_temp = logits.div(data["temperature"]);
    // let predictedNote = tf.multinomial(logits_temp, 2);


    
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