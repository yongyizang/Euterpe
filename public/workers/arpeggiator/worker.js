// This is the older type of worker (non module). 
// You need to use importScripts to import libraries.
// Essentia.js can't be imported this way but Meyda can.
importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js");
importScripts("https://cdn.jsdelivr.net/npm/meyda@5.6.0/dist/web/meyda.min.js")

importScripts("../../libraries/index_rb_no_exports.js");
importScripts("../../utils_no_exports.js");

let config = null;
let messageType = null;
let statusType = null;
let noteType = null;
let parameterType = null;
let workerHookType = null;
// Audio related variables
let pcm = null;
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

function modelInference(inpConcat, hidden1, hidden2){
    let embdsOut = self.embds.predict(inpConcat);
    // gru layer 1
    let i_t_1 = self.ih1.predict(embdsOut);
    let h_t_1 = self.hh1.predict(hidden1);
    let i_t_1_split = tf.split(i_t_1, 3, axis=1);
    let h_t_1_split = tf.split(h_t_1, 3, axis=1);
    let i_reset_1 = i_t_1_split[0];
    let i_upd_1 = i_t_1_split[1];
    let i_new_1 = i_t_1_split[2];
    let h_reset_1 = h_t_1_split[0];
    let h_upd_1 = h_t_1_split[1];
    let h_new_1 = h_t_1_split[2];
    let reset_gate_1 = tf.sigmoid(tf.add(i_reset_1, h_reset_1))
    let update_gate_1 = tf.sigmoid(tf.add(i_upd_1, h_upd_1));
    let new_gate_1 = tf.tanh(tf.add(i_new_1, tf.mul(reset_gate_1, h_new_1)));
    let y1 = tf.add(tf.mul(update_gate_1, hidden1), tf.mul(tf.sub(1, update_gate_1), new_gate_1));
    // gru layer 2
    let i_t_2 = self.ih2.predict(y1);
    let h_t_2 = self.hh2.predict(hidden2);
    let i_t_2_split = tf.split(i_t_2, 3, axis=1);
    let h_t_2_split = tf.split(h_t_2, 3, axis=1);
    let i_reset_2 = i_t_2_split[0];
    let i_upd_2 = i_t_2_split[1];
    let i_new_2 = i_t_2_split[2];
    let h_reset_2 = h_t_2_split[0];
    let h_upd_2 = h_t_2_split[1];
    let h_new_2 = h_t_2_split[2];
    let reset_gate_2 = tf.sigmoid(tf.add(i_reset_2, h_reset_2))
    let update_gate_2 = tf.sigmoid(tf.add(i_upd_2, h_upd_2));
    let new_gate_2 = tf.tanh(tf.add(i_new_2, tf.mul(reset_gate_2, h_new_2)));
    let y2 = tf.add(tf.mul(update_gate_2, hidden2), tf.mul(tf.sub(1, update_gate_2), new_gate_2));

    // onset features and mish
    let onset1 = self.onsetLayer1.predict(y2);
    let onset1_soft  = tf.softplus(onset1);
    let onset1_tanh = tf.tanh(onset1_soft);
    onset1 = tf.mul(onset1, onset1_tanh)

    // pcs features and mish
    let pcs1 = self.pcsLayer1.predict(y2);
    let pcs1_soft  = tf.softplus(pcs1);
    let pcs1_tanh = tf.tanh(pcs1_soft);
    pcs1 = tf.mul(pcs1, pcs1_tanh)
    // final predictions
    let onset_pred = tf.sigmoid(self.onsetLayer2.predict(onset1));
    let pcs_pred = tf.sigmoid(self.pcsLayer2.predict(pcs1));
    
    return [onset_pred, pcs_pred, y1, y2]
}
// Read some audio samples from queue, and process them
// Here we create audio_frames based on windowSize and hopSize
// and we do some basic analysis on each frame (RMS, loudness, chroma)
function readFromQueue() {
    const samples_read = self._audio_reader.dequeue(self.staging);
    if (!samples_read) {
      return 0;
    }
    // samples_read can have less length than staging
    const segment = new Int16Array(samples_read);
    for (let i = 0; i < samples_read; i++) {
      segment[i] = Math.min(Math.max(self.staging[i], -1.0), 1.0) * (2 << 14 - 1);
      if (self.sampleCounter == self.windowSize - 1){
        
        // Here you can do some analysis on the current audio frame
        let channel1 = new Float32Array(self.currentFrame.length / self.channelCount);
        let channel2 = new Float32Array(self.currentFrame.length / self.channelCount);
        let channels = [channel1, channel2];
        deinterleave_custom(self.currentFrame, channels, self.channelCount);
        let features = Meyda.extract(['rms', 'loudness', 'chroma'], channels[0]);
        self._param_writer.enqueue_change(self.workerParameterType.RMS, features.rms);
        self._param_writer.enqueue_change(self.workerParameterType.LOUDNESS, features.loudness.total);
        

        self.audio_frames_queue.push(self.currentFrame);
        self.audio_features_queue.push(features);
        let tempFrame = new Float32Array(self.windowSize);
        // Copy the last windowSize - hopSize samples to the current frame
        // to the beginning of the new frame
        for (let j = 0; j < (self.windowSize - self.hopSize); j++){
            tempFrame[j] = self.currentFrame[j + self.hopSize];
        }
        self.currentFrame = tempFrame;
        self.sampleCounter = self.windowSize - self.hopSize;
      }
        self.currentFrame[self.sampleCounter] = self.staging[i];
        self.sampleCounter += 1;
        
    }
    self.pcm.push(segment);
    return samples_read;
}

function updateParameter(newUpdate){

    // use switch instead
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
        updateParameter(newParameterUI);
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
    self.uiParameterInterval = setInterval(uiParameterObserver, 10);
    console.log("finished loading config")
    
}

// Hook that loads and prepares the algorithm
async function loadAlgorithm() {

    // Load/initialize your algorithm/model here
    tf.setBackend('webgl');
    try {
        self.embds = await tf.loadLayersModel('Checkpoints/embdsLayer/model.json');
        self.ih1 = await tf.loadLayersModel('Checkpoints/ih_1_layer/model.json');
        self.hh1 = await tf.loadLayersModel('Checkpoints/hh_1_layer/model.json')
        self.ih2 = await tf.loadLayersModel('Checkpoints/ih_2_layer/model.json')
        self.hh2 = await tf.loadLayersModel('Checkpoints/hh_2_layer/model.json')
        self.onsetLayer1 = await tf.loadLayersModel('Checkpoints/onsetLayer1/model.json')
        self.onsetLayer2 = await tf.loadLayersModel('Checkpoints/onsetLayer2/model.json')
        self.pcsLayer1 = await tf.loadLayersModel('Checkpoints/pcsLayer1/model.json')
        self.pcsLayer2 = await tf.loadLayersModel('Checkpoints/pcsLayer2/model.json')
    } catch (error) {
        console.error(error);
    }

    postMessage({
        hookType: self.workerHookType.INIT_WORKER,
        message:{
            [self.messageType.STATUS]: 
                    self.statusType.LOADED,
            [self.messageType.TEXT]: 
                    "Worker is loaded",
        },
    })

    // If your model/worker/algorithm needs to be warmed up, do it here
    let inferenceTimes = [];
    for (let i = 0; i < self.config.workerSettings.warmupRounds; i++) {
        // you can sent WARMUP status messages to the UI if you want.

        let aa = performance.now();
        let inpConcat = tf.ones([1, 18]);
        let hidden1 = tf.ones([1, 100]);
        let hidden2 = tf.ones([1, 100]);

        let modelPredictions = modelInference(inpConcat, hidden1, hidden2);
        
        let inferenceTime = performance.now() - aa;
        inferenceTimes.push(inferenceTime);
        console.log(inferenceTime);

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

    // Store the audio data, segment by segments, as array of int16 samples.
    self.pcm = [];

    // The frame/window size
    self.windowSize = 2048 * self.channelCount;

    // The hop size
    self.hopSize = 1024 * self.channelCount;

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
    self.staging = new Float32Array(content.sab.byteLength / 4 / 4 / 2);

    Meyda.bufferSize = self.windowSize;
    
    // Attempt to dequeue every 100ms. Making this deadline isn't critical:
    // there's 1 second worth of space in the queue, and we'll be dequeing
    //   interval = setInterval(readFromQueue, 100);
    self.interval = setInterval(readFromQueue, 100);
    console.log("finished loading audio")
}



// Hook for processing note/MIDI events from the user.
// This hook is called in sync with the clock, and provides
// 1) a buffer with all the raw events since the last clock tick
// 2) a list of all the quantized events for the current tick
// The time spent in this hook should be less than the time between
// two clock ticks. Besides the note/MIDI events, you can also process
// the available audio_features and audio_frames.
async function processClockEvent(content) {

    let predictTime = performance.now();

    let features = self.audio_features_queue.toArrayAndClear()
    // get all the chroma features since the last clock event (tick)
    let chromas = features.map(f => f.chroma);
    let rms = features.map(f => f.rms);
    
    const tickAverageChroma = average2d(chromas);
    // The chroma's we get from Meyda seem to be shifted by 1 left. 
    // That's probably a bug in Meyda. We'll shift it back here.
    shiftRight(tickAverageChroma)
    
    // A dummy blocking operation to simulate a long running
    // simulateBlockingOperation(20);
    let inpConcat = tf.randomNormal([1, 18]);
    let hidden1 = tf.randomNormal([1, 100]);
    let hidden2 = tf.randomNormal([1, 100]);

    let modelPredictions = modelInference(inpConcat, hidden1, hidden2);
    let pcsPredictions = modelPredictions[1].dataSync();
    let pcsPredictionsArray = Array.from(pcsPredictions);

    // The list of notes to be sent to the UI
    let noteList = [];

    const currentTick = content.tick;
    const humanQUantizedInput = content.humanQuantizedInput;
    
    // An example of the Note object the UI expects
    // const note = {
    //     player: "worker",
    //     instrument: "piano",
    //     name: null, 
    //     // Note type can be NOTE_ON, NOTE_OFF, NOTE_HOLD, REST
    //     type: self.noteType.NOTE_ON,
    //     // a number 0-127. 128 is a rest
    //     midi: 60,
    //     // a number 0-11. 12 is a rest
    //     chroma: 0,
    //     // a number 0-127
    //     velocity: 127, 
    //     timestamp: {
    //         // note was generated at this tick
    //         tick: currentTick, 
    //         //Tone.now() // note was generated at this time (seconds)
    //         seconds: null,
    //     },
    //     // When to play the note. Ticks and seconds are added together
    //     playAfter: {
    //         // play the note at the next tick
    //         tick: 1,
    //         // add extra delay to the note (seconds)
    //         seconds: 0
    //     }
    // }
    // noteList.push(note);

    // estimate the inference time of your algorithm
    // the UI keeps track of this, and updates the 
    // maximum supported BPM (in settings)
    predictTime = performance.now() - predictTime;
    self._param_writer.enqueue_change(self.workerParameterType.INFERENCE_TIME, predictTime);

    // console.log("predictTime: " + predictTime)
    // The MICP package the UI expects.
    // postMessage({
    //     messageType: self.messageType.CLOCK_EVENT,
    //     content: {
    //         tick: currentTick,
    //         events: noteList,
    //     }
    // });
    postMessage({
        hookType: self.workerHookType.CLOCK_EVENT,
        message:{
            [self.messageType.CHROMA_VECTOR]: 
                    pcsPredictionsArray,
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
async function processNoteEvent(content){
    // content is a midiEvent object
    let noteList = [];

    /* An example of a simple MIDI processor
     * take the user's input and create an arpeggio
     * the arpeggio should be 4, 8, 12, 16, 8, 4, 0 above the user's input
     * and every note played with a delay of 0.1 seconds from the previous note
     */
    let arpeggio = [3, 5, 8, 12];
    // if this a not off event, add an extra 0.1 sec offset
    let extraSecOffset = content.type == self.noteType.NOTE_OFF ? 0.1 : 0.0;
    for (let i = 0; i < arpeggio.length; i++) {
        // console.log("i", i, "type", content.type, "midi", content.midi, "arp", arpeggio[i])
        let arp_note = {
            player: "worker",
            instrument: "piano",
            name: null,
            type: content.type,
            midi: content.midi + arpeggio[i],
            chroma: null,
            velocity: 127/(i+3),
            playAfter: {
                tick: 0,
                seconds: 0.05 * (i+1) ,//+ extraSecOffset
            },
            // timestamp: {
            //     tick: 0,
            //     seconds: content.timestamp.seconds + 0.1 * (i+1)
            // }
        }
        noteList.push(arp_note);
    }

    console.log(self.audio_frames_queue.length());

    // postMessage({
    //     messageType: self.messageType.NOTE_EVENT,
    //     content: {
    //         // predictTime: predictTime,
    //         // tick: currentTick,
    //         events: noteList,
    //     }
    // });
    postMessage({
        hookType: self.workerHookType.NOTE_EVENT,
        message:{
            [self.messageType.NOTE_LIST]: 
                    noteList,
        },
    })
}

// Hook selector based on the MICP packet type
async function onMessageFunction (obj) {
    if (self.config == null) {
        await self.initWorker(obj.data.content);
        // make sure that the config is loaded
        if (self.config == null) {
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