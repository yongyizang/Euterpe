importScripts("/tf.min.js")

// The dictionary that converts note tokens to the indexes that the AI understands
// For example, the rest token "0_1" is 96
// other tokens are "60_1" (a C4 onset)
// or "60_0" (a C4 hold)
// tokensDict: {}
import * as TokensDict from "@/../public/globalTokenIndexDict.json";

const CHECKPOINT_BASE_URL = "@/../public/checkpoints/"

// Maximum of the localTick
const LOCALMAX = 16;

// TODO These need to go in a central constants place. 
// TODO : I also have them in main.vue (delete them from there also)
const messageType = Object.freeze({
    STATUS: "status",
    INFERENCE: "inference",
  });
const statusType = Object.freeze({
    LOADED: "loaded", // it applies for any type of worker
    WARMUP: "wwarmup",// it usually applies for neural network workers
    SUCCESS: "success",// can be used for any type of worker
    ERROR: "error",// can be used for any type of worker
});

// TODO : this is bachDuet specific. it should go in the worker.
const bar =  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,-1];
const beat = [0,-2,-1,-2, 0,-2,-1,-2, 0,-2,-1,-2, 0,-2,-1,-2];
const accent=[0,-3,-2,-3,-2,-4,-3,-4,-1,-3,-2,-3,-2,-4,-3,-4];
const rhythmTokens = bar.map((element, index) => `${element}_${beat[index]}_${accent[index]}`);



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
        message: "Neural Network is loaded!",
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

// self.lastAiPrediction = {'aiInpMidi':96, 'aiInpCpc':12};
// self.temperature = 0.9;
self.counter = 0;

onmessage = function(e) {

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
    const rhythmTokenInd = this.$store.getters.getTokensDict.rhythm.token2index[rhythmToken];

    // TODO : the worker should be responsible for keeping track of its previous predictions
    // TODO : and shouldn't expect them to be passed to it from the UI
    const aiInp = {
      tick: this.$store.getters.getLocalTick, //input tick time (the AI will predict a note for time tick+1)
      humanInp: this.$store.getters.getHumanInputFor(
        this.$store.getters.getLocalTick
      ), 
      rhythmInd: rhythmTokenInd,
      // for the AI to generate the note for time tick + 1, besides the users input
      // it also takes as an input the note it played/generated for at time tick
      aiInp: this.$store.getters.getAiPredictionFor(
        this.$store.getters.getLocalTick
      ),
      temperature: this.$store.getters.getTemperature,
      reset: this.reset,
      write: this.write,
    };
    /////////////////////////////////////////////////

    if (data["reset"]){
        self.states1A = tf.zeros([1,600]);
        self.states1B = tf.zeros([1,600]);
        self.states2A = tf.zeros([1,600]);
        self.states2B = tf.zeros([1,600]);
        self.first1A = self.states1A;
        self.first1B = self.states1B;
        self.first2A = self.states2A;
        self.first2B = self.states2B;
    }

    var midiInp = tf.tensor2d([[data['aiInp'].midiArticInd, data['humanInp'].midiArticInd]]);
    var cpcInp = tf.tensor2d([[data['aiInp'].cpc, data['humanInp'].cpc]]); 
    var rhyInp = tf.tensor2d([[data['rhythmInd']]]);

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
    
    var logits_temp = logits.div(data["temperature"]);
    var predictedNote = tf.multinomial(logits_temp, 2);

    self.counter = self.counter + 1
    
    predictTime = performance.now() - predictTime;
    postMessage({
        messageType: messageType.INFERENCE,
        message: {
            predictTime: predictTime,
            tick: data['tick'],
            midiArticInd: predictedNote.dataSync()[0],
        }
        
    });
}