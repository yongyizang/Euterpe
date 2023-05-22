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

async function loadAlgorithm() {
    postMessage({
        messageType: self.constants.messageType.STATUS,
        statusType: self.constants.statusType.SUCCESS,
        content: "Worker is ready to play with you!",
    });

}

/* Hook for processing note/MIDI events from the user.
 * This hook is called in sync with the clock, and provides
 * 1) a buffer with all the raw events since the last clock tick
 * 2) a list of all the quantized events for the current tick
 * It is only used if clockBased: true in the config.yaml
 */
async function processClockEvent(content) {
    
}

/* Hook for processing single note events.
 * This hook is called every time a note is played (noteOn or noteOff)
 * It is only used if eventBased: true in the config.yaml
 */
async function processNoteEvent(content){
}

/* Hook for processing the audioBuffer received from the main thread
 * This hook is called every Fs/buffer_size seconds
 * It is only used if audioBasedMode: true in the config.yaml
 */
async function processAudioBuffer(content){
    if (audioCounter < 100) {
        audioBuffer.push(...content);
        audioCounter++;
    } else {
        postMessage({
            messageType: self.constants.messageType.AUDIO_BUFFER,
            content: audioBuffer,
        });
        audioBuffer = [];
        audioCounter = 0;
    }
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