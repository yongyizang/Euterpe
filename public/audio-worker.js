importScripts("/tf.min.js");
let externalJsonLoaded = false;
let config = null;
let constants = {};
let audioCounter = 0;
let audioBuffer = [];

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

async function loadModels() {
    postMessage({
        messageType: self.constants.messageType.STATUS,
        statusType: self.constants.statusType.SUCCESS,
        message: "Worker is ready to play with you!",
    });

}

async function inference(data) {
    
}

async function raw_audio(content){
    if (audioCounter < 100) {
        audioBuffer.push(...content);
        audioCounter++;
    } else {
        postMessage({
            messageType: self.constants.messageType.RAW_AUDIO,
            content: audioBuffer,
        });
        audioBuffer = [];
        audioCounter = 0;
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
            await this.loadModels();
        } else if (obj.data.messageType == self.constants.messageType.LOAD_CONFIG) {
            await this.loadConfig(obj.data.content);
        } else if (obj.data.messageType == self.constants.messageType.RAW_AUDIO) {
            await this.raw_audio(obj.data.content);
        }
    }
}

onmessage = onMessageFunction;