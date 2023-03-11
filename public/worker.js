importScripts("/tf.min.js")
importScripts("/messageTypes.js")

// The dictionary that converts note tokens to the indexes that the AI understands
// For example, the rest token "0_1" is 96
// other tokens are "60_1" (a C4 onset)
// or "60_0" (a C4 hold)
// tokensDict: {}

let tokensDict = {};

fetch('globalTokenIndexDict.json').then(response => {
    return response.json();
}).then(data => {
    // Work with JSON data here
    tokensDict = data;
});

const CHECKPOINT_BASE_URL = "@/../public/checkpoints/"

// Maximum of the localTick
const LOCALMAX = 16;

const bar =  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,-1];
const beat = [0,-2,-1,-2, 0,-2,-1,-2, 0,-2,-1,-2, 0,-2,-1,-2];
const accent=[0,-3,-2,-3,-2,-4,-3,-4,-1,-3,-2,-3,-2,-4,-3,-4];
const rhythmTokens = bar.map((element, index) => `${element}_${beat[index]}_${accent[index]}`);

// This buffer is local for the worker, and it contains its previous outputs
// organized by tick. The worker might just need the its last prediction, so in that 
// case keeping a whole buffer might be an overkill.
// const localWorkerBuffer = measureTicks.reduce((map, tick) => {
//     map[tick] = restNote
//     return map
// }, {})


let lastWorkerPrediction = {
    midi_artic_token_ind: 96,
    cpc: 12
}

async function loadModels(){
    // tf backend doc
    tf.setBackend('webgl');

    // TODO : do we need try/catch here ? 
    self.modelLstm = await tf.loadLayersModel('checkpoints/modelsFinal_Lstm/model.json');
    self.modelEmb =  await tf.loadLayersModel('checkpoints/modelsFinal_Emb/model_cleaned.json');
    
    // Post this message to UI
    postMessage({
        messageType: messageType.STATUS,
        statusType: statusType.LOADED,
        message: "Worker is loaded!",
    });

    warmupRounds = 2; // TODO : this should be a global setting or smth

    var midiInp = tf.tensor2d([[96, 96]]);
    var cpcInp = tf.tensor2d([[12, 12]]); 
    var rhyInp = tf.tensor2d([[4]]);
    self.states1A = tf.zeros([1,600]);
    self.states1B = tf.zeros([1,600]);
    self.states2A = tf.zeros([1,600]);
    self.states2B = tf.zeros([1,600]);
    self.first1A = self.states1A;
    self.first1B = self.states1B;
    self.first2A = self.states2A;
    self.first2B = self.states2B;

    for (let i = 0; i < warmupRounds; i++) {

        var exodos = self.modelEmb.predict([midiInp, cpcInp, rhyInp]);
        var embMidi = exodos[0];
        var embCpc = exodos[1];
        var embRhy = exodos[2];
        var embMidiC = tf.concat([embMidi.slice([0,0,0],[1,1,150]),embMidi.slice([0,1,0],[1,1,150])], 2);
        var embCpcC = tf.concat([embCpc.slice([0,0,0],[1,1,150]),embCpc.slice([0,1,0],[1,1,150])], 2);
        var totalInp = tf.concat([embMidiC, embCpcC, embRhy],2);
        var out = self.modelLstm.predict([totalInp, self.states1A, self.states1B, self.states2A, self.states2B]);

        postMessage({
            messageType: messageType.STATUS,
            statusType: statusType.WARMUP,
            message: "Network is warming up. Current round: " + (i+1) + "/" + warmupRounds, 
        });
    }

    postMessage({
        messageType: messageType.STATUS,
        statusType: statusType.SUCCESS,
        message: "Neural Network is ready to play with you!", 
    });
    
}

loadModels()

// self.lastWorkerPrediction = {'aiInpMidi':96, 'aiInpCpc':12};
// self.temperature = 0.9;
self.counter = 0;


onmessage = function(e) {

    // This is the message from the UI
    // this.worker.postMessage({
    //     tick: this.$store.getters.getLocalTick,
    //     humanInp: this.$store.getters.getHumanInputFor(this.$store.getters.getLocalTick),
    //     // TODO : add the human input buffer also.
    //     randomness: this.$store.getters.getRandomness, // TODO : the Worker is responsible for converting randomness to temperature
    //     reset: this.reset,
    //     write: this.write,
    //   })

    var predictTime = performance.now();
    // TODO e.data will contain only the user's midi numbers they played since the last tick
    // TODO it's the worker's job to convert the polyphonic input to monophonic (if needed) (We can do this on Euterpe also)
    // TODO it's the workers job to use the TokensDict to convert the midi numbers to the tokens the AI understands
    // TODO it's also the workers job to convert the AI's output tokens back to midi numbers
    var data = e.data;

    /////////////////////////////////////////////////
    // TODO : all this is BachDuet specific and should move into the Worker
    const rhythmToken = rhythmTokens[data.tick];
    // getTokensDict is BachDuet specific. 
    const rhythmTokenInd = tokensDict.rhythm.token2index[rhythmToken];

    const temperature = data.temperature;
    const currentTick = data.tick
    const humanInp = data.humanInp;
    const reset = data.reset;
    // const write = data.write;
    // const aiInp = data.aiInp
    // TODO : the worker should be responsible for keeping track of its previous predictions
    // TODO : and shouldn't expect them to be passed to it from the UI


    // for the AI to generate the note for time tick + 1, besides the users input
    // it also takes as an input the note it played/generated for at time tick
    // aiInp = this.$store.getters.getWorkerPredictionFor(
    // this.$store.getters.getLocalTick
    // ),
    /////////////////////////////////////////////////

    if (reset){
        self.states1A = tf.zeros([1,600]);
        self.states1B = tf.zeros([1,600]);
        self.states2A = tf.zeros([1,600]);
        self.states2B = tf.zeros([1,600]);
        self.first1A = self.states1A;
        self.first1B = self.states1B;
        self.first2A = self.states2A;
        self.first2B = self.states2B;
    }

    // var human_midi_artic_token_ind = tokensDict.midi_artic.token2index[humanInp.midiArtic];
    // console.log(humanInp)
    const humanMidiArtic = humanInp.midi.toString() + '_' + humanInp.articulation.toString()
    const humanMidiArticInd = tokensDict.midiArtic.token2index[humanMidiArtic]

    var midiInp = tf.tensor2d([[lastWorkerPrediction.midi_artic_token_ind, humanMidiArticInd]]);
    var cpcInp = tf.tensor2d([[lastWorkerPrediction.cpc, humanInp.cpc]]); 
    var rhyInp = tf.tensor2d([[rhythmTokenInd]]);
    // console.log(`human input ${humanInp.midi}`);


    var exodos = self.modelEmb.predict([midiInp, cpcInp, rhyInp]);
    var embMidi = exodos[0];
    var embCpc = exodos[1];
    var embRhy = exodos[2];
    var embMidiC = tf.concat([embMidi.slice([0,0,0],[1,1,150]),embMidi.slice([0,1,0],[1,1,150])], 2);
    var embCpcC = tf.concat([embCpc.slice([0,0,0],[1,1,150]),embCpc.slice([0,1,0],[1,1,150])], 2);
    var totalInp = tf.concat([embMidiC, embCpcC, embRhy],2);

    
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
    const midi_artic = tokensDict.midiArtic.index2token[midi_artic_token_ind];
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
        messageType: messageType.INFERENCE,
        message: {
            predictTime: predictTime,
            tick: currentTick,
            note: note
        }
    });
}

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