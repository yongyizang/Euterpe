importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js");

let constants = {};
let externalJsonLoaded = false;
let config = null;

// BachDuet Specific variables
const CHECKPOINT_BASE_URL = "@/../public/checkpoints/"
let tokensDict = null;
const bar = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1];
const beat = [0, -2, -1, -2, 0, -2, -1, -2, 0, -2, -1, -2, 0, -2, -1, -2];
const accent = [0, -3, -2, -3, -2, -4, -3, -4, -1, -3, -2, -3, -2, -4, -3, -4];
const rhythmTokens = bar.map((element, index) => `${element}_${beat[index]}_${accent[index]}`);
let counter = 0;
let lastWorkerPrediction = {
    midi_artic_token_ind: 96,
    cpc: 12
}

// You can load any external JSON files you have here
async function loadExternalJson() {
    // constants.json defines the messagetype and statustype constants
    await fetch('constants.json').then(response => {
        return response.json();
    }).then(data => {
        self.constants = data;
    });

    // The dictionary that converts note tokens to the indexes that the AI understands
    // For example, the rest token "0_1" is 96
    // other tokens are "60_1" (a C4 onset)
    // or "60_0" (a C4 hold)
    await fetch('globalTokenIndexDict.json').then(response => {
        return response.json();
    }).then(data => {
        self.tokensDict = data;
    });
}

async function loadConfig(config) {
    self.config = config;
    self.ticksPerMeasure = config.clockBasedSettings.ticksPerBeat * config.clockBasedSettings.timeSignature.numerator;
}

async function loadAlgorithm() {

    // tf backend doc
    tf.setBackend('webgl');

    try {
        self.modelLstm = await tf.loadLayersModel('checkpoints/modelsFinal_Lstm/model.json');
        self.modelEmb = await tf.loadLayersModel('checkpoints/modelsFinal_Emb/model_cleaned.json');
    } catch (error) {
        console.error(error);
    }

    // Post this message to UI
    postMessage({
        messageType: self.constants.messageType.STATUS,
        statusType: self.constants.statusType.LOADED,
        content: "Worker is loaded!",
    });

    // If your model/worker needs to be initialized and warmed up, do it here
    var midiInp = tf.tensor2d([[96, 96]]);
    var cpcInp = tf.tensor2d([[12, 12]]);
    var rhyInp = tf.tensor2d([[4]]);
    self.states1A = tf.zeros([1, 600]);
    self.states1B = tf.zeros([1, 600]);
    self.states2A = tf.zeros([1, 600]);
    self.states2B = tf.zeros([1, 600]);
    self.first1A = self.states1A;
    self.first1B = self.states1B;
    self.first2A = self.states2A;
    self.first2B = self.states2B;

    for (let i = 0; i < self.config.workerSettings.warmupRounds; i++) {

        var exodos = self.modelEmb.predict([midiInp, cpcInp, rhyInp]);
        var embMidi = exodos[0];
        var embCpc = exodos[1];
        var embRhy = exodos[2];
        var embMidiC = tf.concat([embMidi.slice([0, 0, 0], [1, 1, 150]), embMidi.slice([0, 1, 0], [1, 1, 150])], 2);
        var embCpcC = tf.concat([embCpc.slice([0, 0, 0], [1, 1, 150]), embCpc.slice([0, 1, 0], [1, 1, 150])], 2);
        var totalInp = tf.concat([embMidiC, embCpcC, embRhy], 2);
        var out = self.modelLstm.predict([totalInp, self.states1A, self.states1B, self.states2A, self.states2B]);

        // you can sent WARMUP status messages to the UI if you want.
        postMessage({
            messageType: self.constants.messageType.STATUS,
            statusType: self.constants.statusType.WARMUP,
            content: "Network is warming up. Current round: " + (i + 1) + "/" + self.config.workerSettings.warmupRounds,
        });
    }

    // Once your model/worker is ready to play, post a success message to the UI
    postMessage({
        messageType: self.constants.messageType.STATUS,
        statusType: self.constants.statusType.SUCCESS,
        content: "Neural Network is ready to play with you!",
    });

}

// Hook for processing note/MIDI events from the user.
// This hook is called in sync with the clock, and provides
// 1) a buffer with all the raw events since the last clock tick
// 2) a list of all the quantized events for the current tick
async function processClockEvent(content) {
    // console.log("processClockEvent called at tick: ", content.tick);
    var predictTime = performance.now();

    /////////////////////////////////////////////////
    // TODO : all this is BachDuet specific 
    const rhythmToken = rhythmTokens[content.tick];
    // getTokensDict is BachDuet specific. 
    const rhythmTokenInd = self.tokensDict.rhythm.token2index[rhythmToken];

    // randomness is controlled by a slider in the UI and has values from 0 to 1
    // here we map it to the sampling temperature of our model which needs to be between 0.2 and 2
    const temperature = 0.2 + 1.8 * content.randomness;
    const currentTick = content.tick;
    const humanInp = content.humanQuantizedInput;
    
    if (content.reset) {
        self.states1A = tf.zeros([1, 600]);
        self.states1B = tf.zeros([1, 600]);
        self.states2A = tf.zeros([1, 600]);
        self.states2B = tf.zeros([1, 600]);
        self.first1A = self.states1A;
        self.first1B = self.states1B;
        self.first2A = self.states2A;
        self.first2B = self.states2B;
    }

    let clipedMidi = -1;
    let humanArtic = -1;
    let humanCpc = -1;
    if (humanInp.length == 0){
        humanInp.push({type: self.constants.noteType.REST, midi: 128})
        clipedMidi = 0
        humanArtic = 1
        humanCpc = 12
    }
    else {
        clipedMidi = humanInp[0].midi
        while (clipedMidi < 28 && clipedMidi > 0){
            clipedMidi += 12
        }
        while (clipedMidi > 94 && clipedMidi < 128){
            clipedMidi -= 12
        }
        humanArtic = humanInp[0].type === self.constants.noteType.NOTE_ON ? 1 : 0;
        clipedMidi % 12;

        humanCpc = clipedMidi % 12;
    }
    

    // console.log(clipedMidi);
    // if humanInp.type is "on" then articulation is 1, if type = "hold" then articulation is 0
    // const humanArtic = humanInp[0].type === "on" ? 1 : 0;
    // if the humanInp type is "on" or "rest", then articulation is 1, if type = "hold" then articulation is 0
    // const humanArtic = humanInp[0].type === self.constants.noteType.NOTE_ON || humanInp[0].type === self.constants.noteType.NOTE_HOLD ? 1 : 0;
    // if 
    // let humanCpc = clipedMidi % 12;
    // if (clipedMidi == 0) {
    //     humanCpc = 12;
    // }
    const humanMidiArtic = clipedMidi.toString() + '_' + humanArtic.toString()
    console.log(humanMidiArtic, humanCpc);
    const humanMidiArticInd = self.tokensDict.midiArtic.token2index[humanMidiArtic];

    var midiInp = tf.tensor2d([[lastWorkerPrediction.midi_artic_token_ind, humanMidiArticInd]]);
    var cpcInp = tf.tensor2d([[lastWorkerPrediction.cpc, humanCpc]]); 
    var rhyInp = tf.tensor2d([[rhythmTokenInd]]);
    // console.log(`human input ${humanInp.midi}`);


    var exodos = self.modelEmb.predict([midiInp, cpcInp, rhyInp]);
    var embMidi = exodos[0];
    var embCpc = exodos[1];
    var embRhy = exodos[2];
    var embMidiC = tf.concat([embMidi.slice([0, 0, 0], [1, 1, 150]), embMidi.slice([0, 1, 0], [1, 1, 150])], 2);
    var embCpcC = tf.concat([embCpc.slice([0, 0, 0], [1, 1, 150]), embCpc.slice([0, 1, 0], [1, 1, 150])], 2);
    var totalInp = tf.concat([embMidiC, embCpcC, embRhy], 2);


    var out = self.modelLstm.predict([totalInp, self.states1A, self.states1B, self.states2A, self.states2B]);

    // postMessage({'predictTime': predictTime});

    self.states1A = out[1];
    self.states1B = out[2];
    self.states2A = out[3];
    self.states2B = out[4];

    var logits = out[0]

    var logits_temp = logits.div(temperature);
    var predictedNote = tf.multinomial(logits_temp, 2);

    self.counter = self.counter + 1

    predictTime = performance.now() - predictTime;

    // TODO : convert the predicted note back to midi
    // no matter what the worker predicts, the UI will always expect a midi note
    const midi_artic_token_ind = predictedNote.dataSync()[0]

    // the tick that the AI run to make this prediction
    // Note that this prediction is to be played at the next tick
    // var tick = workerPrediction.tick
    const midi_artic = self.tokensDict.midiArtic.index2token[midi_artic_token_ind];
    // console.log(midi_artic)
    // split the midiArtic token to get the midi number and the articulation
    let midi = parseInt(midi_artic.split("_")[0]);
    const articulation = parseInt(midi_artic.split("_")[1]);
    let cpc = midi % 12;

    if (midi == 0) {
        midi = 128; // BachDuet uses 0 for rest but Euterpe expects 128 for rest
        cpc = 12;
    }

    // if midi = 128, the it is a rest
    let type = null;
    if (midi==128){
        type = self.constants.noteType.REST;
    } else{
        type = articulation === 1 ? self.constants.noteType.NOTE_ON : self.constants.noteType.NOTE_HOLD;
    }
    
    
    

    const note = {
        player: "worker",
        name: null, // BachDuet doesn't generate the note's name
        type: type,
        midi: midi,
        chroma: cpc,
        velocity: 127, // BachDuet uses 127 for all notes
        timestamp: {
            tick: currentTick, // note was generated at this tick
            seconds: null,//Tone.now() // note was generated at this time (seconds)
        },
        playAfter: {
            tick: 1, // play the note at the next tick
            seconds: 0 // time is not used by BachDuet
        }
    }

    let noteList = [];//[note];
    // BachDuet is a monophonic model. If the current prediction is a noteON and the previous prediction was not a rest
    // then we need to send a noteOFF for the previous note
    // We need to do the same if the current prediction is a REST and the previous prediction was not a rest
    if (note.type == self.constants.noteType.NOTE_ON && lastWorkerPrediction.type != self.constants.noteType.REST ||
        note.type == self.constants.noteType.REST && lastWorkerPrediction.type != self.constants.noteType.REST) {
        const noteOff = {
            player: "worker",
            name: null,
            type: self.constants.noteType.NOTE_OFF,
            midi: lastWorkerPrediction.midi,
            chroma: lastWorkerPrediction.cpc,
            velocity: 127,
            timestamp: {
                tick: currentTick, // note was generated at this tick
                seconds: null,//Tone.now() // note was generated at this time (seconds)
            },
            playAfter: {
                tick: 1, // play the note at the next tick
                seconds: 0 // time is not used by BachDuet
            }
        }
        noteList.push(noteOff);
        console.log("Tick ", currentTick, "worker ALSO gives noteOFF", noteOff.midi, "/", noteOff.type)
    }

    noteList.push(note);
    // console.log("worker prediction", noteList);

      // to be used for the next inference step by the worker itself
    // this is an internal state of the worker. BachDuet needs to keep track of the last prediction
    lastWorkerPrediction = {
        midi_artic_token_ind: midi_artic_token_ind,
        cpc: cpc,
        midi: midi,
        type: type
    }
    console.log("Tick ", currentTick, "worker gives", note.midi, "/", note.type, " ")
    postMessage({
        messageType: self.constants.messageType.CLOCK_EVENT,
        content: {
            predictTime: predictTime,
            tick: currentTick,
            events: noteList,
        }
    });
}

// Hook for processing the audioBuffer received from the main thread
// This hook is called every Fs/buffer_size seconds
async function processAudioBuffer(content){
    // console.log("raw_audio", content);
}

// Hook for processing single note events.
// This hook is called every time a note is played
async function processNoteEvent(content){
    // console.log("NOTE_EVENT", content);
    const note = {
        player: "worker",
        name: null, // BachDuet doesn't generate the note's name
        type: articulation === 1 ? self.constants.noteType.NOTE_ON : self.constants.noteType.NOTE_HOLD,
        midi: midi,
        chroma: cpc,
        velocity: 127, // BachDuet uses 127 for all notes
        // timestamp: {
        //     tick: content.timestamp.tick, // note was generated at this globalTick
        //     seconds: performance.now() // note was generated at this time (seconds)
        // },
        playAfter: {
            tick: 0, // play the note at the next tick
            seconds: 0 // time is not used by BachDuet
        }
    }

    let noteList = [note];

    postMessage({
        messageType: self.constants.messageType.NOTE_EVENT,
        content: {
            // predictTime: predictTime,
            // tick: currentTick,
            events: noteList,
        }
    });
}

// Hook selector based on the MICP packet type
async function onMessageFunction (obj) {
    if (!self.externalJsonLoaded) {
        await self.loadExternalJson();
        self.externalJsonLoaded = true;
        onMessageFunction(obj);
    } else {
        if (obj.data.messageType == self.constants.messageType.CLOCK_EVENT) {
            await this.processClockEvent(obj.data.content);
        } else if (obj.data.messageType == self.constants.messageType.LOAD_ALGORITHM) {
            await this.loadAlgorithm();
        } else if (obj.data.messageType == self.constants.messageType.LOAD_CONFIG) {
            await this.loadConfig(obj.data.content);
        } else if (obj.data.messageType == self.constants.messageType.AUDIO_BUFFER) {
            await this.processAudioBuffer(obj.data.content);
        } else if (obj.data.messageType == self.constants.messageType.NOTE_EVENT){
            await this.processNoteEvent(obj.data.content);
        }
    }
}

onmessage = onMessageFunction;