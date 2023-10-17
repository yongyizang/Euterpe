// This is the older type of worker (non module). 
// You need to use importScripts to import libraries.
// Essentia.js can't be imported this way but Meyda can.
importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js");
importScripts("https://cdn.jsdelivr.net/npm/meyda@5.6.0/dist/web/meyda.min.js");

importScripts("../../libraries/index_rb_no_exports.js");
importScripts("../../utils.js");

// Import hooks
importScripts("./initAgent_hook.js");
importScripts("./processClockEvent_hook.js");
importScripts("./processNoteEvent_hook.js");
importScripts("./processAudioBuffer_hook.js");

let config = null;
let playerType = null;
let instrumentType = null;  
let messageType = null;
let statusType = null;
let noteType = null;
let parameterType = null;
let agentHookType = null;
let testVar = 42;
// Audio related variables
let channelCount = null;
let sampleRate = null;
let staging = null;
let _audio_reader = null;
let audio_frames_queue = null;
let audio_features_queue = null;
let frames = null;
let windowSize = null;
let hopSize = null;
let sampleCounter = null;
let currentFrame = null;
let frameCounter = null;
let interval = null;
let uiParameterInterval = null;

let _param_reader = null;
let _param_writer = null;
let newParameterUI = null;

let prevStartTime = performance.now();

// Read some audio samples from queue, and process them
// Here we create audio_frames based on windowSize and hopSize
// and we send them for processing in the processAudioBuffer() hook
function _readFromQueue() {
    const samples_read = self._audio_reader.dequeue(self.staging);
    if (!samples_read) {
        return 0;
    }
    // samples_read can have less length than staging
    for (let i = 0; i < samples_read; i++) {
        if (self.sampleCounter == self.windowSize - 1){
        
            // Here you can do some analysis on the current audio frame
            let channel1 = new Float32Array(self.currentFrame.length / self.channelCount);
            let channel2 = new Float32Array(self.currentFrame.length / self.channelCount);
            let channels = [channel1, channel2];
            // console.log("in read from queue");
            deinterleave_custom(self.currentFrame, channels, self.channelCount);
            let tempFrame = new Float32Array(self.windowSize);
            // Copy the last windowSize - hopSize samples to the current frame
            // to the beginning of the new frame
            for (let j = 0; j < (self.windowSize - self.hopSize); j++){
                tempFrame[j] = self.currentFrame[j + self.hopSize];
            }
            self.currentFrame = tempFrame;
            self.sampleCounter = self.windowSize - self.hopSize;

            self.processAudioBuffer(channels);
        }
        self.currentFrame[self.sampleCounter] = self.staging[i];
        self.sampleCounter += 1;
    }
    return samples_read;
}

function _uiParameterObserver(){
    let newParameterUI = { index: null, value: null };
    if (self._param_reader.dequeue_change(newParameterUI)) {
        console.log("param index: " + newParameterUI.index + " value: " + newParameterUI.value);
        updateParameter(newParameterUI);
    }
}

// Hook that takes the necessary configuration data from the main thread
async function initAgent(content) {
    console.log("inside initAgent");
    try {
        loadConfig(content);
        loadExternalFiles(content);
        loadAlgorithm(content);
        initAudio(content);
        initParameterSharing(content);
        console.log("Initialization complete");
    } catch (error) {
        console.error("Error initializing worker:", error);
    }
}

function initParameterSharing(content){
    // Reads parameters from the UI (sliders, buttons, etc.)
    self._param_reader = new ParameterReader(
        new RingBuffer(content.sab_par_ui, Uint8Array)
    );
    // Writes parameters to the UI (e.g., rms, loudness, inference time, etc.)
    // The parameters need to be single float values
    self._param_writer = new ParameterWriter(
        new RingBuffer(content.sab_par_agent, Uint8Array)
    );
    self.uiParameterInterval = setInterval(_uiParameterObserver, 100);
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
    self._audio_reader = new AudioReader(
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
    self.framesPerTick = self.sampleRate * self.channelCount * 60 / 
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
    self.audio_frames_queue = new LIFOQueue(16 * self.framesPerTick);

    // Same for the audio features queue. These features are extracted
    // from the audio frames. 
    self.audio_features_queue = new LIFOQueue(16 * self.framesPerTick);
    
    // The current frame/window array. We'll keep pushing samples to it
    // untill it's full (windowSize samples). Then we'll push it to the
    // audio_frames_queue and start a new frame/window.
    self.currentFrame = new Float32Array(self.windowSize);

    // This counter will be used to keep track of the number of samples
    // we have pushed to the current frame/window.
    self.sampleCounter = 0
    
    /*
    // A smaller staging array to copy the audio samples from, before conversion
    // to uint16. It's size is 4 times less than the 1 second worth of data
    // that the ring buffer can hold, so it's 250ms, allowing to not make
    // deadlines:
    */
    self.staging = new Float32Array(self.hopSize);

    Meyda.bufferSize = self.windowSize;
    
    self.interval = setInterval(_readFromQueue, 10);
    console.log("finished setting up audio")
}

// Hook selector based on the MICP packet type
async function onMessageFunction (obj) {
    if (self.config == null) {
        await self.initAgent(obj.data.content);
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
            self.processClockEvent(obj.data.content);
        } else if (obj.data.hookType == self.agentHookType.NOTE_EVENT){
            // The NoteEvent we receive from the UI is serialized
            // We need to deserialize it
            let noteEvent = NoteEvent.fromPlain(obj.data.content);
            self.processNoteEvent(noteEvent);
        }
    }
    return;
}

onmessage = onMessageFunction;