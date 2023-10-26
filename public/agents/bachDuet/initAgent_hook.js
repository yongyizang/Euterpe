import { resetBachDuetState } from './bachDuetUtils.js';

/**
 * Even though you can initialize variables outside of any function,
 * here we use initAgentVariables() to initialize variables that are
 * dependent information that exist on an external json file.
 * Check the definition of loadExternalFiles(), to see how we 
 * call initAgentVariables() after loading the json file.
 */
export function initAgentVariables() {
    console.log("just entered initAgentVariables")
    // GUI controleld parameters
    self.temperature = 0.1;

    // Other variables necessary for BachDuet
    let restMidi = 0;
    let restArtic = 1;
    let restCpc = 12;
    let restMidiArtic = restMidi.toString() + '_' + restArtic.toString();
    let restMidiArticInd = self.tokenIndexDict.midiArtic.token2index[restMidiArtic];
    // restNote needs to be accessed from processClockEvent_hook.js
    // so we need to declare it as a agent-global variable (using self)
    self.restNote = {midi: restMidi,
                    artic: restArtic,
                    midiArticInd: restMidiArticInd,
                    cpc: restCpc};
    self.lastBachDuetNote = self.restNote;
}

export function updateParameter(newUpdate){
    
    switch(newUpdate.index){
        case self.uiParameterType.SLIDER_1:
            self.temperature = newUpdate.value;
            break;
        case self.uiParameterType.BUTTON_1:
            // button 1 is the reset button
            resetBachDuetState();
            break;
        default:
            console.warn("Invalid parameter type");
            break;
    }
}

export async function loadExternalFiles(content) {
    // Put your code here
    await fetch('globalTokenIndexDict.json').then(response => {
        return response.json();
    }).then(data => {
        self.tokenIndexDict = data;
        console.log("just loaded tokenIndexDict");
        initAgentVariables();
    });
}

export async function loadAlgorithm(content) {
    
    tf.setBackend('webgl');
    try {
        self.modelLstm = await tf.loadLayersModel('checkpoints/modelsFinal_Lstm/model.json');
        self.modelEmb =  await tf.loadLayersModel('checkpoints/modelsFinal_Emb/model_cleaned.json');
    } catch (error) {
        console.error(error);
    }
    postMessage({
        hookType: self.agentHookType.INIT_AGENT,
        message:{
            [self.messageType.STATUS]: 
                    self.statusType.LOADED,
            [self.messageType.TEXT]: 
                    "Core algorithm is loaded",
        },
    })

    // Warm up the model
    resetBachDuetState();
    let midiInp = tf.tensor2d([[96, 96]]);
    let cpcInp = tf.tensor2d([[12, 12]]); 
    let rhyInp = tf.tensor2d([[4]]);
    let inferenceTimes = [];
    for (let i = 0; i < self.config.agentSettings.warmupRounds; i++) {
        let start = performance.now();
        let exodos = self.modelEmb.predict([midiInp, cpcInp, rhyInp]);
        let embMidi = exodos[0];
        let embCpc = exodos[1];
        let embRhy = exodos[2];
        let embMidiC = tf.concat([embMidi.slice([0,0,0],[1,1,150]),embMidi.slice([0,1,0],[1,1,150])], 2);
        let embCpcC = tf.concat([embCpc.slice([0,0,0],[1,1,150]),embCpc.slice([0,1,0],[1,1,150])], 2);
        let totalInp = tf.concat([embMidiC, embCpcC, embRhy],2);
        let out = self.modelLstm.predict([totalInp, self.states1A, self.states1B, self.states2A, self.states2B]);

        let inferenceTime = performance.now() - start;
        inferenceTimes.push(inferenceTime);
        // console.log(inferenceTime);
        // you can sent WARMUP status messages to the UI if you want.
        // these will appear in the intro screen
        postMessage({
            hookType: self.agentHookType.INIT_AGENT,
            message:{
                [self.messageType.STATUS]: 
                        self.statusType.WARMUP,
                [self.messageType.TEXT]: 
                        "BachDuet is warming up. Current round: " + (i + 1) + "/" + self.config.agentSettings.warmupRounds,
            },
        })
    }
    resetBachDuetState();

    // Once your model/agent is ready to play, 
    // UI expects a success message, don't forget to send it.
    postMessage({
        hookType: self.agentHookType.INIT_AGENT,
        message:{
            [self.messageType.STATUS]: 
                    self.statusType.SUCCESS,
            [self.messageType.TEXT]: 
                    "The Agent is ready to interact with you!",
        },
    })
}