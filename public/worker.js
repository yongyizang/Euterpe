importScripts("/tf.min.js");
const CHECKPOINT_BASE_URL = "@/../public/checkpoints/"
// Maximum of the localTick
const LOCALMAX = 16;
const bar = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1];
const beat = [0, -2, -1, -2, 0, -2, -1, -2, 0, -2, -1, -2, 0, -2, -1, -2];
const accent = [0, -3, -2, -3, -2, -4, -3, -4, -1, -3, -2, -3, -2, -4, -3, -4];
const rhythmTokens = bar.map((element, index) => `${element}_${beat[index]}_${accent[index]}`);
let counter = 0;
let externalJsonLoaded = false;
let config = null;
let lastWorkerPrediction = {
    midi_artic_token_ind: 96,
    cpc: 12
}
let constants = {};
let tokensDict = {};

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
    // tokensDict: {}
    await fetch('globalTokenIndexDict.json').then(response => {
        return response.json();
    }).then(data => {
        self.tokensDict = data;
    });
}

async function loadConfig(config) {
    self.config = config;
}

async function loadModels() {
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
        message: "Worker is loaded!",
    });

    warmupRounds = 2; // TODO : this should be a global setting or smth

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

    for (let i = 0; i < warmupRounds; i++) {

        var exodos = self.modelEmb.predict([midiInp, cpcInp, rhyInp]);
        var embMidi = exodos[0];
        var embCpc = exodos[1];
        var embRhy = exodos[2];
        var embMidiC = tf.concat([embMidi.slice([0, 0, 0], [1, 1, 150]), embMidi.slice([0, 1, 0], [1, 1, 150])], 2);
        var embCpcC = tf.concat([embCpc.slice([0, 0, 0], [1, 1, 150]), embCpc.slice([0, 1, 0], [1, 1, 150])], 2);
        var totalInp = tf.concat([embMidiC, embCpcC, embRhy], 2);
        var out = self.modelLstm.predict([totalInp, self.states1A, self.states1B, self.states2A, self.states2B]);

        postMessage({
            messageType: self.constants.messageType.STATUS,
            statusType: self.constants.statusType.WARMUP,
            message: "Network is warming up. Current round: " + (i + 1) + "/" + warmupRounds,
        });
    }

    postMessage({
        messageType: self.constants.messageType.STATUS,
        statusType: self.constants.statusType.SUCCESS,
        message: "Neural Network is ready to play with you!",
    });

}

async function inference(data) {
    var predictTime = performance.now();
    // TODO e.data will contain only the user's midi numbers they played since the last tick
    // TODO it's the worker's job to convert the polyphonic input to monophonic (if needed) (We can do this on Euterpe also)
    // TODO it's the workers job to use the TokensDict to convert the midi numbers to the tokens the AI understands
    // TODO it's also the workers job to convert the AI's output tokens back to midi numbers

    /////////////////////////////////////////////////
    // TODO : all this is BachDuet specific and should move into the Worker
    const rhythmToken = rhythmTokens[data.tick];
    // getTokensDict is BachDuet specific. 
    const rhythmTokenInd = self.tokensDict.rhythm.token2index[rhythmToken];

    const temperature = data.randomness * 2;
    const currentTick = data.tick;
    const humanInp = data.humanInp;

    if (data.reset) {
        self.states1A = tf.zeros([1, 600]);
        self.states1B = tf.zeros([1, 600]);
        self.states2A = tf.zeros([1, 600]);
        self.states2B = tf.zeros([1, 600]);
        self.first1A = self.states1A;
        self.first1B = self.states1B;
        self.first2A = self.states2A;
        self.first2B = self.states2B;
    }

    // var human_midi_artic_token_ind = tokensDict.midi_artic.token2index[humanInp.midiArtic];
    // console.log(humanInp)
    const humanMidiArtic = humanInp.midi.toString() + '_' + humanInp.articulation.toString()
    const humanMidiArticInd = self.tokensDict.midiArtic.token2index[humanMidiArtic]

    var midiInp = tf.tensor2d([[lastWorkerPrediction.midi_artic_token_ind, humanMidiArticInd]]);
    var cpcInp = tf.tensor2d([[lastWorkerPrediction.cpc, humanInp.cpc]]);
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
    // split the midiArtic token to get the midi number and the articulation
    const midi = parseInt(midi_artic.split("_")[0]);
    const articulation = parseInt(midi_artic.split("_")[1]);
    let cpc = midi % 12;
    if (midi == 0) {
        cpc = 12;
    }
    const note = {
        midi: midi,
        articulation: articulation,
        cpc: cpc,
    }
    // to be used for the next inference step by the worker itself
    lastWorkerPrediction = {
        midi_artic_token_ind: midi_artic_token_ind,
        cpc: cpc
    }
    // or use note from tone.js to create a note object
    // const note = {
    //     midi: midi,
    //     articulation: articulation,
    //     cpc: cpc,
    // }
    // console.log(`output ${lastWorkerPrediction.cpc}`);
    postMessage({
        messageType: self.constants.messageType.INFERENCE,
        message: {
            predictTime: predictTime,
            tick: currentTick,
            note: note
        }
    });
}

async function onMessageFunction (obj) {
    if (!self.externalJsonLoaded) {
        await self.loadExternalJson();
        self.externalJsonLoaded = true;
        onMessageFunction(obj);
    } else {
        if (obj.data.messageType == self.constants.messageType.INFERENCE) {
            await this.inference(obj.data.content);
        } else if (obj.data.messageType == self.constants.messageType.LOAD_MODEL) {
            await this.loadModels();
        } else if (obj.data.messageType == self.constants.messageType.LOAD_CONFIG) {
            await this.loadConfig(obj.data.content);
        }
    }
}

onmessage = onMessageFunction;

/*
Note

Events 
    Midi Event
        NoteOn/NoteOff
        velocity
        midi
        channel
        time
    Grid Event
        tick
        articulation (0,1,2,3)
*/