importScripts("/tf.min.js")
// import { Note } from "@tonaljs/tonal";

// The dictionary that converts note tokens to the indexes that the AI understands
// For example, the rest token "0_1" is 96
// other tokens are "60_1" (a C4 onset)
// or "60_0" (a C4 hold)
// tokensDict: {}

const tokensDict = {"midiArtic": {"index2token": {"0": "62_1", "1": "62_0", "2": "69_1", "3": "69_0", "4": "66_1", "5": "66_0", "6": "64_1", "7": "64_0", "8": "67_1", "9": "67_0", "10": "38_1", "11": "38_0", "12": "50_1", "13": "50_0", "14": "47_1", "15": "47_0", "16": "49_1", "17": "49_0", "18": "45_1", "19": "45_0", "20": "43_1", "21": "43_0", "22": "42_1", "23": "42_0", "24": "40_1", "25": "40_0", "26": "37_1", "27": "37_0", "28": "63_1", "29": "63_0", "30": "70_1", "31": "70_0", "32": "65_1", "33": "65_0", "34": "68_1", "35": "68_0", "36": "39_1", "37": "39_0", "38": "51_1", "39": "51_0", "40": "48_1", "41": "48_0", "42": "46_1", "43": "46_0", "44": "44_1", "45": "44_0", "46": "41_1", "47": "41_0", "48": "71_1", "49": "71_0", "50": "52_1", "51": "52_0", "52": "72_1", "53": "72_0", "54": "53_1", "55": "53_0", "56": "73_1", "57": "73_0", "58": "54_1", "59": "54_0", "60": "74_1", "61": "74_0", "62": "55_1", "63": "55_0", "64": "75_1", "65": "75_0", "66": "56_1", "67": "56_0", "68": "76_1", "69": "76_0", "70": "57_1", "71": "57_0", "72": "77_1", "73": "77_0", "74": "58_1", "75": "58_0", "76": "78_1", "77": "78_0", "78": "59_1", "79": "59_0", "80": "79_1", "81": "79_0", "82": "60_1", "83": "60_0", "84": "80_1", "85": "80_0", "86": "61_1", "87": "61_0", "88": "35_1", "89": "35_0", "90": "36_1", "91": "36_0", "92": "81_1", "93": "81_0", "94": "82_1", "95": "82_0", "96": "0_1", "97": "83_1", "98": "83_0", "99": "33_1", "100": "33_0", "101": "34_1", "102": "34_0", "103": "84_1", "104": "84_0", "105": "85_1", "106": "85_0", "107": "86_1", "108": "86_0", "109": "87_1", "110": "87_0", "111": "31_1", "112": "31_0", "113": "32_1", "114": "32_0", "115": "88_1", "116": "89_1", "117": "90_1", "118": "88_0", "119": "91_1", "120": "89_0", "121": "92_1", "122": "90_0", "123": "91_0", "124": "92_0", "125": "30_1", "126": "30_0", "127": "29_1", "128": "29_0", "129": "28_1", "130": "28_0", "131": "93_1", "132": "93_0", "133": "94_1", "134": "94_0"}, "token2index": {"62_1": 0, "62_0": 1, "69_1": 2, "69_0": 3, "66_1": 4, "66_0": 5, "64_1": 6, "64_0": 7, "67_1": 8, "67_0": 9, "38_1": 10, "38_0": 11, "50_1": 12, "50_0": 13, "47_1": 14, "47_0": 15, "49_1": 16, "49_0": 17, "45_1": 18, "45_0": 19, "43_1": 20, "43_0": 21, "42_1": 22, "42_0": 23, "40_1": 24, "40_0": 25, "37_1": 26, "37_0": 27, "63_1": 28, "63_0": 29, "70_1": 30, "70_0": 31, "65_1": 32, "65_0": 33, "68_1": 34, "68_0": 35, "39_1": 36, "39_0": 37, "51_1": 38, "51_0": 39, "48_1": 40, "48_0": 41, "46_1": 42, "46_0": 43, "44_1": 44, "44_0": 45, "41_1": 46, "41_0": 47, "71_1": 48, "71_0": 49, "52_1": 50, "52_0": 51, "72_1": 52, "72_0": 53, "53_1": 54, "53_0": 55, "73_1": 56, "73_0": 57, "54_1": 58, "54_0": 59, "74_1": 60, "74_0": 61, "55_1": 62, "55_0": 63, "75_1": 64, "75_0": 65, "56_1": 66, "56_0": 67, "76_1": 68, "76_0": 69, "57_1": 70, "57_0": 71, "77_1": 72, "77_0": 73, "58_1": 74, "58_0": 75, "78_1": 76, "78_0": 77, "59_1": 78, "59_0": 79, "79_1": 80, "79_0": 81, "60_1": 82, "60_0": 83, "80_1": 84, "80_0": 85, "61_1": 86, "61_0": 87, "35_1": 88, "35_0": 89, "36_1": 90, "36_0": 91, "81_1": 92, "81_0": 93, "82_1": 94, "82_0": 95, "0_1": 96, "83_1": 97, "83_0": 98, "33_1": 99, "33_0": 100, "34_1": 101, "34_0": 102, "84_1": 103, "84_0": 104, "85_1": 105, "85_0": 106, "86_1": 107, "86_0": 108, "87_1": 109, "87_0": 110, "31_1": 111, "31_0": 112, "32_1": 113, "32_0": 114, "88_1": 115, "89_1": 116, "90_1": 117, "88_0": 118, "91_1": 119, "89_0": 120, "92_1": 121, "90_0": 122, "91_0": 123, "92_0": 124, "30_1": 125, "30_0": 126, "29_1": 127, "29_0": 128, "28_1": 129, "28_0": 130, "93_1": 131, "93_0": 132, "94_1": 133, "94_0": 134}}, "pitchClass": {"index2token": {"0": 2, "1": 9, "2": 6, "3": 4, "4": 7, "5": 11, "6": 1, "7": 3, "8": 10, "9": 5, "10": 8, "11": 0, "12": 12}, "token2index": {"2": 0, "9": 1, "6": 2, "4": 3, "7": 4, "11": 5, "1": 6, "3": 7, "10": 8, "5": 9, "8": 10, "0": 11, "12": 12}}, "rhythm": {"index2token": {"0": "0_0_-1", "1": "0_-2_-3", "2": "0_-1_-2", "3": "-1_-2_-3", "4": "1_0_0", "5": "0_0_-2", "6": "0_-2_-4", "7": "0_-1_-3", "8": "-1_-2_-4", "9": "-1_-1_-3"}, "token2index": {"0_0_-1": 0, "0_-2_-3": 1, "0_-1_-2": 2, "-1_-2_-3": 3, "1_0_0": 4, "0_0_-2": 5, "0_-2_-4": 6, "0_-1_-3": 7, "-1_-2_-4": 8, "-1_-1_-3": 9}}, "keys": {"index2token": {"0": "D major", "1": "A major", "2": "E minor", "3": "G major", "4": "E- major", "5": "B- major", "6": "F minor", "7": "A- major", "8": "E major", "9": "B major", "10": "F# minor", "11": "F major", "12": "C major", "13": "G minor", "14": "F# major", "15": "C# major", "16": "G# minor", "17": "A minor", "18": "B- minor", "19": "B minor", "20": "C minor", "21": "C# minor", "22": "D minor", "23": "E- minor"}, "token2index": {"D major": 0, "A major": 1, "E minor": 2, "G major": 3, "E- major": 4, "B- major": 5, "F minor": 6, "A- major": 7, "E major": 8, "B major": 9, "F# minor": 10, "F major": 11, "C major": 12, "G minor": 13, "F# major": 14, "C# major": 15, "G# minor": 16, "A minor": 17, "B- minor": 18, "B minor": 19, "C minor": 20, "C# minor": 21, "D minor": 22, "E- minor": 23}}};
// import * as TokensDict from "@/../public/globalTokenIndexDict.json";
// importScripts("globalTokenIndexDict.json");

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