// If needed, you can import any external libraries here (e.g., tensorflow.js)
// importScripts("/tf.min.js");

let constants = {};
let externalJsonLoaded = false;
let config = null;

// You can load any external JSON files you have here
async function loadExternalJson() {
    // constants.json defines the messagetype and statustype constants
    await fetch('constants.json').then(response => {
        return response.json();
    }).then(data => {
        self.constants = data;
    });
}
// Hook that takes the config.yaml from the UI.
async function loadConfig(config) {
    self.config = config;
    self.ticksPerMeasure = config.clockBasedSettings.ticksPerBeat * config.clockBasedSettings.timeSignature.numerator;
}

// Hook that loads and prepares the algorithm
async function loadAlgorithm() {

    // Load/initialize your algorithm/model here

    // The UI expects a LOADED status message.
    postMessage({
        messageType: self.constants.messageType.STATUS,
        statusType: self.constants.statusType.LOADED,
        content: "Worker is loaded!",
    });

    // If your model/worker/algorithm needs to be warmed up, do it here
    for (let i = 0; i < self.config.workerSettings.warmupRounds; i++) {

        // you can sent WARMUP status messages to the UI if you want.
        postMessage({
            messageType: self.constants.messageType.STATUS,
            statusType: self.constants.statusType.WARMUP,
            content: "Worker is warming up. Current round: " + (i + 1) + "/" + self.config.workerSettings.warmupRounds,
        });
    }

    // Once your model/worker is ready to play, 
    // UI expects a success message
    postMessage({
        messageType: self.constants.messageType.STATUS,
        statusType: self.constants.statusType.SUCCESS,
        content: "Worker is ready to interact with you!",
    });

}

// Hook for processing note/MIDI events from the user.
// This hook is called in sync with the clock, and provides
// 1) a buffer with all the raw events since the last clock tick
// 2) a list of all the quantized events for the current tick
async function processEventsBuffer(content) {
    var predictTime = performance.now();

    const randomness = content.randomness;
    const currentTick = content.tick;
    const humanQUantizedInput = content.humanQuantizedInput;
    
    if (content.reset) {
        // If the user clicks the reset button, you can
        // reset your algorithm here
    }
    
    // An example of the Note object the UI expects
    const note = {
        player: "worker",
        name: null, 
        // Note type can be NOTE_ON, NOTE_OFF, NOTE_HOLD, REST
        type: self.constants.noteTypes.NOTE_ON,
        // a number 0-127. 128 is a rest
        midi: 60,
        // a number 0-11. 12 is a rest
        chroma: 0,
        // a number 0-127
        velocity: 127, 
        timestamp: {
            // note was generated at this tick
            tick: currentTick, 
            //Tone.now() // note was generated at this time (seconds)
            seconds: null,
        },
        // When to play the note. Ticks and seconds are added together
        playAfter: {
            // play the note at the next tick
            tick: 1,
            // add extra delay to the note (seconds)
            seconds: 0
        }
    }

    let noteList = [];
    noteList.push(note);

    // estimate the inference time of your algorithm
    // the UI keeps track of this, and will warn the user
    // if the inference time higher than the clock's period
    predictTime = performance.now() - predictTime;

    // The MICP package the UI expects.
    postMessage({
        messageType: self.constants.messageType.EVENTS_BUFFER,
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
    // content is a midiEvent object
    let noteList = [];
    // An example of a simple MIDI processor
    // take the user's input and create an arpeggio
    // the arpeggio should be 4, 8, 12, 16, 8, 4, 0 above the user's input
    // and every note played with a delay of 0.1 seconds from the previous note
    let arpeggio = [3,6,8,6,3,0];
    for (let i = 0; i < arpeggio.length; i++) {
        let arp_note = {
            player: "worker",
            name: null,
            type: content.type,
            midi: content.midi + arpeggio[i],
            chroma: null,
            velocity: 127,
            playAfter: {
                tick: 0,
                seconds: 0.1 * (i+1)
            },
            // timestamp: {
            //     tick: 0,
            //     seconds: content.timestamp.seconds + 0.1 * (i+1)
            // }
        }
        noteList.push(arp_note);
    }

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
        if (obj.data.messageType == self.constants.messageType.EVENTS_BUFFER) {
            await this.processEventsBuffer(obj.data.content);
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