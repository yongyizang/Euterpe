importScripts("/tf.min.js");
let counter = 0;
let externalJsonLoaded = false;
let config = null;
let constants = {};

async function loadExternalJson() {
    // constants.json defines the messagetype and statustype constants
    await fetch('constants.json').then(response => {
        return response.json();
    }).then(data => {
        self.constants = data;
    });
}

async function loadConfig(config) {
    self.config = config;
}

async function inference(data) {
    // var predictTime = performance.now();
    let currentTick = data.tick;
    let humanInp = data.humanInp;
    // if not empty
    if (humanInp.midi != 0) {
        let note = {
            midi: humanInp.midi - 12,
            articulation: humanInp.articulation,
            cpc: null
        }
        postMessage({
            messageType: self.constants.messageType.INFERENCE,
            message: {
                predictTime: 0,
                tick: currentTick,
                note: note
            }
        });
    } else {
        let note = {
            midi: 0,
            articulation: humanInp.articulation,
            cpc: null
        }
        postMessage({
            messageType: self.constants.messageType.INFERENCE,
            message: {
                predictTime: 0,
                tick: currentTick,
                note: note
            }
        });
    }
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
            postMessage({
                messageType: self.constants.messageType.STATUS,
                statusType: self.constants.statusType.SUCCESS,
                message: "Neural Network is ready to play with you!",
            });
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