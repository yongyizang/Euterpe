// This is the older type of worker (non module). 
// You need to use importScripts to import libraries.
// Essentia.js can't be imported this way but Meyda can.
importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js");
importScripts("https://cdn.jsdelivr.net/npm/meyda@5.6.0/dist/web/meyda.min.js")

importScripts("../../libraries/index_rb_no_exports.js");
importScripts("../../utils.js");

let config = null;
let playerType = null;
let instrumentType = null;  
let messageType = null;
let statusType = null;
let noteType = null;
let parameterType = null;
let workerHookType = null;

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

let prevTime = performance.now();

// worker parameters that correspond to UI widgets
// you should change their names to match your 
// worker's parameters, e.g. slider3 --> randomness
let slider1 = null;
let slider2 = null;
let slider3 = null;
let slider4 = null;
let button1 = null;
let button2 = null;
let button3 = null;
let button4 = null;
let switch1 = null;
let switch2 = null;
let switch3 = null;
let switch4 = null;

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

function _updateParameter(newUpdate){

    // This is where the mapping of the UI widgets
    // to the worker parameters happens
    // E.g., if you want to map slider3 to 
    // the 'randomness' parameter of the algorithm
    // you can modify the SLIDER_3 case
    // to be: self.randomness = newUpdate.value;
    switch(newUpdate.index){
        case self.uiParameterType.SLIDER_1:
            self.slider1 = newUpdate.value;
            break;
        case self.uiParameterType.SLIDER_2:
            self.slider2 = newUpdate.value;
            break;
        case self.uiParameterType.SLIDER_3:
            self.slider3 = newUpdate.value;
            break;
        case self.uiParameterType.SLIDER_4:
            self.slider4 = newUpdate.value;
            break;
        case self.uiParameterType.BUTTON_1:
            self.button1 = newUpdate.value;
            break;
        case self.uiParameterType.BUTTON_2:
            self.button2 = newUpdate.value;
            break;
        case self.uiParameterType.BUTTON_3:
            self.button3 = newUpdate.value;
            break;
        case self.uiParameterType.BUTTON_4:
            self.button4 = newUpdate.value;
            break;
        case self.uiParameterType.SWITCH_1:
            self.switch1 = newUpdate.value;
            break;
        case self.uiParameterType.SWITCH_2:
            self.switch2 = newUpdate.value;
            break;
        case self.uiParameterType.SWITCH_3:
            self.switch3 = newUpdate.value;
            break;
        case self.uiParameterType.SWITCH_4:
            self.switch4 = newUpdate.value;
            break;
        default:
            console.log("Invalid parameter type");
            break;
    }
}

function uiParameterObserver(){
    let newParameterUI = { index: null, value: null };
    if (self._param_reader.dequeue_change(newParameterUI)) {
        console.log("param index: " + newParameterUI.index + " value: " + newParameterUI.value);
        _updateParameter(newParameterUI);
    }
}

// Hook that takes the necessary configuration data from the main thread
async function initWorker(content) {
    console.log("inside initWorker");
    try {
        loadConfig(content);
        loadAlgorithm();
        initAudio(content);
        console.log("Initialization complete");
    } catch (error) {
        console.error("Error initializing worker:", error);
    }
}

async function loadConfig(content) {
    self.config = content.config;
    self.playerType = content.playerType;
    self.instrumentType = content.instrumentType;
    self.noteType = content.noteType;
    self.statusType = content.statusType;
    self.messageType = content.messageType;
    self.uiParameterType = content.uiParameterType;
    self.workerParameterType = content.workerParameterType;
    self.workerHookType = content.workerHookType;
    self.ticksPerMeasure = self.config.clockBasedSettings.ticksPerBeat * 
                            self.config.clockBasedSettings.timeSignature.numerator;
    // If you have any external JSON files, you can load them here
    //     await fetch('extraData.json').then(response => {
    //         return response.json();
    //     }).then(data => {
    //         self.extraData = data;
    //     });
    self.uiParameterInterval = setInterval(uiParameterObserver, 100);
    console.log("finished loading config")
    
}

// Hook that loads and prepares the algorithm
async function loadAlgorithm() {

    // Load/initialize your algorithm/model here
    // A simple example of loading a model with tensorflow.js

    // tf.setBackend('webgl');
    // try {
    //     self.model = await tf.loadLayersModel('Checkpoints/model.json');
    // } catch (error) {
    //     console.error(error);
    // }

    postMessage({
        hookType: self.workerHookType.INIT_WORKER,
        message:{
            [self.messageType.STATUS]: 
                    self.statusType.LOADED,
            [self.messageType.TEXT]: 
                    "Worker is loaded",
        },
    })

    // If your model/worker/algorithm needs to be warmed up (e.g. neural networks), 
    // you can do it here
    let inferenceTimes = [];
    for (let i = 0; i < self.config.workerSettings.warmupRounds; i++) {

        
        let aa = performance.now();

        simulateBlockingOperation(10);

        let inferenceTime = performance.now() - aa;
        inferenceTimes.push(inferenceTime);

        // you can sent WARMUP status messages to the UI if you want.
        // these will appear in the intro screen
        postMessage({
            hookType: self.workerHookType.INIT_WORKER,
            message:{
                [self.messageType.STATUS]: 
                        self.statusType.WARMUP,
                [self.messageType.TEXT]: 
                        "Worker is warming up. Current round: " + (i + 1) + "/" + self.config.workerSettings.warmupRounds,
            },
        })
    }

    console.log("Average inference time: " + inferenceTimes.reduce((a, b) => a + b, 0) / inferenceTimes.length);

    // Once your model/worker is ready to play, 
    // UI expects a success message
    postMessage({
        hookType: self.workerHookType.INIT_WORKER,
        message:{
            [self.messageType.STATUS]: 
                    self.statusType.SUCCESS,
            [self.messageType.TEXT]: 
                    "Worker is ready to interact with you!",
        },
    })
    console.log("finished loading algorithm")

}

// Hook that receives sharedArrayBuffers from the main UI
// and creates readers/writers to read/write audio/parameter
// data to them.
// Audio related initializations also happen here.
async function initAudio(content){
    // console.log(content)
    // Reads audio samples directly from the microphone
    self._audio_reader = new AudioReader(
        new RingBuffer(content.sab, Float32Array)
    );
    // Reads parameters from the UI (sliders, buttons, etc.)
    self._param_reader = new ParameterReader(
        new RingBuffer(content.sab_par_ui, Uint8Array)
    );
    // Writes parameters to the UI (e.g., rms, loudness)
    // The parameters need to be single float values
    self._param_writer = new ParameterWriter(
        new RingBuffer(content.sab_par_worker, Uint8Array)
    );

    // The number of channels of the audio stream read from the queue.
    self.channelCount = content.channelCount;
    // The sample-rate of the audio stream read from the queue.
    self.sampleRate = content.sampleRate;

    // The frame/window size
    self.windowSize = self.config.audio.windowSize * self.channelCount;

    // The hop size
    self.hopSize = self.config.audio.hopSize * self.channelCount;

    // Audio Frames per clock tick
    self.framesPerTick = self.sampleRate * self.channelCount * 60 / 
                         60 / // self.config.clockBasedSettings.tempo
                        self.hopSize / 
                        self.config.clockBasedSettings.ticksPerBeat;

    // Store the audio data, as an array of frames
    // each frame is as array of float32 samples.
    // the size of the frame is equal to windowSize
    // This will be used in the AUDIO_BUFFER hook to
    // to feed the audio frames to the worker's music interaction algorithm.
    // We use a LIFOQueue to store the frames, so that we can efficiently
    // push and pop frames from the queue.
    // We set the max size of the queue to the equivalent duration of 16 clock ticks
    self.audio_frames_queue = new LIFOQueue(16 * self.framesPerTick);
    // Same for the audio features queue. These features are extracted
    // from the audio frames. 
    self.audio_features_queue = new LIFOQueue(16 * self.framesPerTick);
    
    // the current frame/window array. We'll keep pushing samples to it
    // untill it's full (windowSize samples). Then we'll push it to the
    // audio_frames_queue and start a new frame/window.
    self.currentFrame = new Float32Array(self.windowSize);

    // This counter will be used to keep track of the number of samples
    // we have pushed to the current frame/window.
    self.sampleCounter = 0

    // A smaller staging array to copy the audio samples from, before conversion
    // to uint16. It's size is 4 times less than the 1 second worth of data
    // that the ring buffer can hold, so it's 250ms, allowing to not make
    // deadlines:
    // staging buffer size = ring buffer byteLengthsize / sizeof(float32) /4 / 2?
    // self.staging = new Float32Array(content.sab.byteLength / 4 / 4 / 2);
    self.staging = new Float32Array(self.hopSize);

    Meyda.bufferSize = self.windowSize;
    
    // Attempt to dequeue every 100ms. Making this deadline isn't critical:
    // there's 1 second worth of space in the queue, and we'll be dequeing
    // self.interval = setInterval(_readFromQueue, 100);
    self.interval = setInterval(_readFromQueue, 10);
    console.log("finished loading audio")
}

// This hook is called every time a new audio buffer is available
// and it runs on the same thread as the rest of the worker,
// so don't do any heavy processing here.
function processAudioBuffer(buffer) {
    // Buffer has 2 channels (stereo), buffer[0] and buffer[1]

    // The buffers that processAudioBuffer receives are of size windowSize (config.yaml)
    // And they are overlaped according to the hopSize (config.yaml)

    // An example of how you can use Meyda to extract audio features from the left channel
    let features = Meyda.extract(['rms', 'loudness', 'chroma'], buffer[0]);

    // An example of how you can send those features to the UI
    // Since these features are estimated many times per second,
    // it's better to push them to the sharedArrayBuffer queue that 
    // the worker shares with the UI, instead of sending them 
    // using postMessage(). Note that you can only use this way to
    // send single float values
    // The values you send through the queue will be shown in the Monitor (GUI)
    // Make sure you have first declared them in config_widgets.yaml
    // The first arg for enqueue_change is the parameter id (see config_widgets.yaml)
    // and the second arg is the float value you want to send. 
    // self._param_writer.enqueue_change(0, features.rms);
    // self._param_writer.enqueue_change(1, features.loudness.total);

    // Here we push the overlapped audio frames and their features
    // to the local queues. These queues can be used in the 
    // processClockEvent() and processNoteEvent() hooks.
    self.audio_frames_queue.push(buffer[0]);
    self.audio_features_queue.push(features);
}

// Hook for processing note/MIDI events from the user.
// This hook is called in sync with the clock, and provides
// 1) a buffer with all the raw events since the last clock tick
// 2) a list of all the quantized events for the current tick
// The time spent in this hook should be less than the time between
// two clock ticks. Besides the note/MIDI events, you can also process
// the available audio_features and audio_frames.
async function processClockEvent(content) {
    
    let currentTime = performance.now();
    let timeDiff = currentTime - prevTime;
    prevTime = currentTime;

    let predictTime = performance.now(); 
    const currentTick = content.tick;   


    
    let features = self.audio_features_queue.toArrayAndClear()
    let chromas = features.map(f => f.chroma);
    let rms = features.map(f => f.rms);
    self._param_writer.enqueue_change(5, chromas.length);

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
    let actualBPM = 60 / (actualPeriod / 1000) / self.config.clockBasedSettings.ticksPerBeat;
    let error = actualBPM - 100;//self.config.clockBasedSettings.tempo;
    self._param_writer.enqueue_change(3, actualBPM);
    self._param_writer.enqueue_change(4, error);
    // console.log("agentWorker: " + Math.round(currentBPM) + " error: " + error);

    let noteList = [];
    let dividedBy2 = currentTick % 2 == 0;
    let dividedBy4 = currentTick % 4 == 0;
    let dividedBy8 = currentTick % 8 == 0;
    if (dividedBy2){
        const drumNote = new NoteEvent();
        drumNote.player = self.playerType.WORKER;
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
        drumNote.player = self.playerType.WORKER;
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
        drumNote.player = self.playerType.WORKER;
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
    predictTime = performance.now() - predictTime;
    // use the parameter id for Inference Time in config_widgets.yaml
    self._param_writer.enqueue_change(2, predictTime);

    // At this stage, the worker has finished processing the clock event
    // and sends the results to the UI. Since we estimated a chroma vector
    // for the current tick, we'll send using the CHROMA_VECTOR message type.
    // We can send a list of notes to be played using the NOTE_LIST message type.
    // Finally, when in processClockEvent() hook,
    // you should always send a CLOCK_TIME message type, so that the UI
    // can check whether the worker is in sync with the clock.
    // console.log("sending clock event");
    
    // Print to the console the .midi field for every element in the noteList
    // noteList.forEach(element => console.log(element.midi));
    postMessage({
        hookType: self.workerHookType.CLOCK_EVENT,
        message:{
            [self.messageType.CHROMA_VECTOR]: 
                    tickAverageChroma,
            [self.messageType.NOTE_LIST]: 
                    noteList,
            [self.messageType.CLOCK_TIME]:
                    currentTick
        },
    })
}

// Hook for processing single user note events.
// This hook is called every time a note/midi event
// is received by the user
async function processNoteEvent(noteEventPlain){
    // The NoteEvent we receive from the UI is serialized
    // We need to deserialize it
    let noteEvent = NoteEvent.fromPlain(noteEventPlain);
    let noteList = [];

    /* 
     * An example of a simple MIDI processor
     * take the user's input and create an arpeggio
     * the arpeggio should type depends on the state of switch1
     * and it is [3, 5, 8, 12] if switch is one
     * or [4, 7, 9, 12] if switch is zero
     * Every note of the arpegio played with a delay
     * of 0.1 seconds from the previous note and 1/3 of the 
     * velocity of its previous note
     */
    // let arpeggio = [];
    // if (self.switch1 == 0){
    //     arpeggio = [3, 5, 8, 12, 15];
    // } else{
    //     arpeggio = [4, 7, 9, 12, 9, 7, 4];
    // }
    let arpeggio = [3];

    // if this a not off event, add an extra 0.1 sec offset.
    // This is a temp fix for the pianoSampler bug
    // let extraSecOffset = noteEvent.type == self.noteType.NOTE_OFF ? 0.1 : 0.0;

    // if (noteEvent.type == self.noteType.NOTE_ON){
        for (let i = 0; i < arpeggio.length; i++) {
            let arp_note = new NoteEvent();
            arp_note.player = self.playerType.WORKER;
            arp_note.instrument = self.instrumentType.SYNTH;
            arp_note.type = noteEvent.type;
            arp_note.midi = noteEvent.midi + arpeggio[i];
            arp_note.velocity = noteEvent.velocity
            // arp_note.createdAt 
            arp_note.playAfter = {
                tick: 0,
                seconds: 0,//(i+1)*0.05 ,//+ extraSecOffset
            },
            // arp_note.duration = {
            //     tick: 0,
            //     seconds: 1,//+ extraSecOffset
            // },

            noteList.push(arp_note);
        }

        // Let's also create a label that will be displayed in the UIs TextBox
        let label = noteEvent.name;

        // Similar to the processClockEvent() hook, we send the results
        // to the UI. In this example we send a list of the arpeggio notes
        // we estimated for the user's input.
        postMessage({
            hookType: self.workerHookType.NOTE_EVENT,
            message:{
                [self.messageType.NOTE_LIST]: 
                        noteList,
                [self.messageType.LABEL]:
                        label
            }
        });
    // }
}
// }

async function processNoteEventV2(noteEventPlain){
    // The NoteEvent we receive from the UI is serialized
    // We need to deserialize it
    let noteEvent = NoteEvent.fromPlain(noteEventPlain);
    let noteList = [];

    /* 
     * An example of a simple MIDI processor
     * take the user's input and create an arpeggio
     * the arpeggio should type depends on the state of switch1
     * and it is [3, 5, 8, 12] if switch is one
     * or [4, 7, 9, 12] if switch is zero
     * Every note of the arpegio played with a delay
     * of 0.1 seconds from the previous note and 1/3 of the 
     * velocity of its previous note
     */
    let arpeggio = [];
    if (self.switch1 == 1){
        arpeggio = [3, 5, 8, 12];
    } else{
        arpeggio = [4, 7, 9, 12, 9, 7, 4];
    }

    // if this a not off event, add an extra 0.1 sec offset.
    // This is a temp fix for the pianoSampler bug
    // let extraSecOffset = noteEvent.type == self.noteType.NOTE_OFF ? 0.1 : 0.0;
    if (noteEvent.type == self.noteType.NOTE_ON){
        for (let i = 0; i < arpeggio.length; i++) {
            let arp_note = new NoteEvent();
            arp_note.player = self.playerType.WORKER;
            arp_note.instrument = self.instrumentType.PIANO;
            arp_note.type = noteEvent.type;
            arp_note.midi = noteEvent.midi + arpeggio[i];
            arp_note.velocity = noteEvent.velocity
            // arp_note.createdAt 
            arp_note.playAfter = {
                tick: 0,//i + 1,
                seconds: 0.8 * (i+1) ,//+ extraSecOffset
            },
            arp_note.duration = {
                tick: 0,
                seconds: 0.1,//+ extraSecOffset
            },

            noteList.push(arp_note);
        }
    

        // Let's also create a label that will be displayed in the UIs TextBox
        let label = noteEvent.name;

        // Similar to the processClockEvent() hook, we send the results
        // to the UI. In this example we send a list of the arpeggio notes
        // we estimated for the user's input.
        postMessage({
            hookType: self.workerHookType.NOTE_EVENT,
            message:{
                [self.messageType.NOTE_LIST]: 
                        noteList,
                [self.messageType.LABEL]:
                        label
            }
        });
    }
}

// Hook selector based on the MICP packet type
async function onMessageFunction (obj) {
    if (self.config == null) {
        
        await self.initWorker(obj.data.content);
        // make sure that the config is loaded
        if (self.config == null) {
            console.error("Worker not initialized correctly. Failed to load config")
            return;
        }
        else {
        console.log("Worker is not initialized");
        return;
        }
    } else {
        if (obj.data.hookType == self.workerHookType.CLOCK_EVENT) {
            await self.processClockEvent(obj.data.content);
        } else if (obj.data.hookType == self.workerHookType.NOTE_EVENT){
            await self.processNoteEvent(obj.data.content);
        }
    }
}

onmessage = onMessageFunction;