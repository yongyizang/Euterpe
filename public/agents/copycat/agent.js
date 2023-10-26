import { 
    updateParameter, 
    loadAlgorithm, 
    loadExternalFiles} from './initAgent_hook.js';
import { processClockEvent } from './processClockEvent_hook.js';
import { processNoteEvent } from './processNoteEvent_hook.js';
import { processAudioBuffer } from './processAudioBuffer_hook.js';
import { deinterleave_custom } from './../../../src/utils/helpers.js';
import { LIFOQueue } from './../../../src/utils/dataStructures.js';
import { NoteEvent } from './../../../src/utils/NoteEvent.js';
import {
    AudioReader,
    ParameterReader,
    ParameterWriter,
    RingBuffer,
  } from './../../libraries/ringbuffer/index_rb_exports.js';

// Global variables shared between the agent.js and the hooks
// need to be declared using the self keyword
// Local variables can be declared using the let keyword (or const)
self.config = null;
self.playerType = null;
self.instrumentType = null;  
self.messageType = null;
self.statusType = null;
self.noteType = null;
self.parameterType = null;
self.agentHookType = null;

// Audio related variables
self.channelCount = null;
self.sampleRate = null;
self.audio_frames_queue = null;
self.audio_features_queue = null;
self.windowSize = null;
self.hopSize = null;

let staging = null;
let _audio_reader = null;
let framesPerTick = null;
let sampleCounter = null;
let currentFrame = null;
let stagingIntervalID = null;
let uiParameterIntervalID = null;

self.param_reader = null;
self.param_writer = null;

/*
    This is a dictionary that maps the midi numbers of the notes
    the user played, to the notes the agent responded for that
    particular note.
    Then, when the agent receives a note-off event, it can use
    this dictionary to know which note(s) to turn off.
    To be used by the processNoteEvent() hook.
    An example of how to use it can be found 
    in public/agents/pianoGenie/processNoteEvent_hook.js
*/
self.userToAgentNoteMapping = {};

// Read some audio samples from queue, and process them
// Here we create audio_frames based on windowSize and hopSize
// and we send them for processing in the processAudioBuffer() hook
function _readFromQueue() {
    const samples_read = _audio_reader.dequeue(staging);
    if (!samples_read) {
        return 0;
    }
    // samples_read can have less length than staging
    for (let i = 0; i < samples_read; i++) {
        if (sampleCounter == self.windowSize - 1){
        
            // Here you can do some analysis on the current audio frame
            let channel1 = new Float32Array(currentFrame.length / self.channelCount);
            let channel2 = new Float32Array(currentFrame.length / self.channelCount);
            let channels = [channel1, channel2];
            // console.log("in read from queue");
            deinterleave_custom(currentFrame, channels, self.channelCount);
            let tempFrame = new Float32Array(self.windowSize);
            // Copy the last windowSize - hopSize samples to the current frame
            // to the beginning of the new frame
            for (let j = 0; j < (self.windowSize - self.hopSize); j++){
                tempFrame[j] = currentFrame[j + self.hopSize];
            }
            currentFrame = tempFrame;
            sampleCounter = self.windowSize - self.hopSize;

            processAudioBuffer(channels);
        }
        currentFrame[sampleCounter] = staging[i];
        self.sampleCounter += 1;
    }
    return samples_read;
}

function _uiParameterObserver(){
    let newParameterUI = { index: null, value: null };
    if (self.param_reader.dequeue_change(newParameterUI)) {
        console.log("param index: " + newParameterUI.index + " value: " + newParameterUI.value);
        updateParameter(newParameterUI);
    }
}

function initParameterSharing(content){
    // Reads parameters from the UI (sliders, buttons, etc.)
    self.param_reader = new ParameterReader(
        new RingBuffer(content.sab_par_ui, Uint8Array)
    );
    // Writes parameters to the UI (e.g., rms, loudness, inference time, etc.)
    // The parameters need to be single float values
    self.param_writer = new ParameterWriter(
        new RingBuffer(content.sab_par_agent, Uint8Array)
    );
    uiParameterIntervalID = setInterval(_uiParameterObserver, 100);
}

function loadConfig(content) {
    self.config = content.config;
    self.playerType = content.playerType;
    self.instrumentType = content.instrumentType;
    self.noteType = content.noteType;
    self.statusType = content.statusType;
    self.messageType = content.messageType;
    self.uiParameterType = content.uiParameterType;
    self.agentHookType = content.agentHookType;
    self.ticksPerMeasure = self.config.clockSettings.ticksPerBeat * 
                            self.config.clockSettings.timeSignature.numerator;
    console.log("finished loading config")
}

/*
    Hook that receives sharedArrayBuffers from the main UI
    and creates readers/writers to read/write audio
    data to them.
    Audio related initializations also happen here.
*/
function initAudio(content){
    // console.log(content)
    // Reads audio samples directly from the microphone
    _audio_reader = new AudioReader(
        new RingBuffer(content.sab, Float32Array)
    );

    // The number of channels of the audio stream read from the queue.
    self.channelCount = content.channelCount;
    // The sample-rate of the audio stream read from the queue.
    self.sampleRate = content.sampleRate;

    // The frame/window size
    self.windowSize = self.config.audioModeSettings.windowSize * self.channelCount;

    // The hop size
    self.hopSize = self.config.audioModeSettings.hopSize * self.channelCount;

    // Audio Frames per clock tick
    framesPerTick = self.sampleRate * self.channelCount * 60 / 
                         60 / // self.config.clockSettings.tempo
                        self.hopSize / 
                        self.config.clockSettings.ticksPerBeat;

    /*
    Store the audio data, as an array of frames
    each frame is as array of float32 samples.
    the size of the frame is equal to windowSize
    This will be used in the AUDIO_BUFFER hook to
    to feed the audio frames to the worker's music interaction algorithm.
    We use a LIFOQueue to store the frames, so that we can efficiently
    push and pop frames from the queue.
    We set the max size of the queue to the equivalent duration of 16 clock ticks
    */
    self.audio_frames_queue = new LIFOQueue(16 * framesPerTick);

    // Same for the audio features queue. These features are extracted
    // from the audio frames. 
    self.audio_features_queue = new LIFOQueue(16 * framesPerTick);
    
    // The current frame/window array. We'll keep pushing samples to it
    // untill it's full (windowSize samples). Then we'll push it to the
    // audio_frames_queue and start a new frame/window.
    currentFrame = new Float32Array(self.windowSize);

    // This counter will be used to keep track of the number of samples
    // we have pushed to the current frame/window.
    sampleCounter = 0
    
    /*
    // A smaller staging array to copy the audio samples from, before conversion
    // to uint16. It's size is 4 times less than the 1 second worth of data
    // that the ring buffer can hold, so it's 250ms, allowing to not make
    // deadlines:
    */
    staging = new Float32Array(self.hopSize);

    // Meyda.bufferSize = self.windowSize;
    stagingIntervalID = setInterval(_readFromQueue, 10);
    console.log("finished setting up audio")
}

// Hook selector based on the MICP packet type
async function onMessageFunction (obj) {
    if (self.config == null) {
        await initAgent(obj.data.content);
        // make sure that the config is loaded
        if (self.config == null) {
            console.error("Agent not initialized correctly. Failed to load config")
            return;
        } else {
            console.log("Agent is initialized");
            return;
        }
    } else {
        if (obj.data.hookType == self.agentHookType.CLOCK_EVENT) {
            // The NoteEvents we receive from the UI are serialized
            // We need to deserialize them
            let content = obj.data.content;
            if (content.humanContinuousBuffer) {
                content.humanContinuousBuffer = 
                    content.humanContinuousBuffer.map(
                        serializedNoteEvent => NoteEvent.fromPlain(serializedNoteEvent));
            }
            if (content.humanQuantizedInput) {
                content.humanQuantizedInput = 
                    content.humanQuantizedInput.map(
                        serializedNoteEvent => NoteEvent.fromPlain(serializedNoteEvent));
            }
            let startTime = performance.now();
            let message = processClockEvent(content);
            let endTime = performance.now();
            if (typeof message === 'undefined')
                message = {};
            message[self.messageType.INFERENCE_TIME] = endTime - startTime;
            message[self.messageType.CLOCK_TIME] = content.tick;
            postMessage({
                hookType: self.agentHookType.CLOCK_EVENT, // Do not modify
                message: message
            });
        } else if (obj.data.hookType == self.agentHookType.NOTE_EVENT){
            // The NoteEvents we receive from the UI are serialized
            // We need to deserialize them
            let noteEvent = NoteEvent.fromPlain(obj.data.content);
            let message = processNoteEvent(noteEvent);
            if (typeof message !== 'undefined')
                postMessage({
                    hookType: self.agentHookType.NOTE_EVENT,
                    message: message
                });
        }
    }
    return;
}

// Hook that takes the necessary configuration data from the main thread
async function initAgent(content) {
    console.log("inside initAgent");
    try {
        loadConfig(content);
        loadExternalFiles();
        loadAlgorithm();
        initAudio(content);
        initParameterSharing(content);
        console.log("Initialization complete");
    } catch (error) {
        console.error("Error initializing worker:", error);
    }
}

self.onmessage = onMessageFunction;