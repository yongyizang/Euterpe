/*
    First, you should set the Agent parameters that are controllable
    by UI elements. Those UI elements are defined in config_widgets.yaml
    under the settingsModal section.

    You should change their names to match your worker's parameters,
    e.g. slider1 --> gain, slider2 --> randomness etc
         switch1 --> arpeggioType

    Currently you can use up to 4 sliders and 4 switches.
    You can delete the ones you don't need.

    NOTE: You should use the 'self' keyword to define the parameters
        e.g. self.gain = 0.5;
        that way, they will be accessible from the other hooks and the agent.js
*/
self.temperature = 0.1;
self.resetState = 0;

const CHECKPOINT_BASE_URL = "/checkpoints/"

/*
    This function is invoked every time there is a change in the UI parameters. 
    This is where the mapping of the UI widgets to the worker parameters happens
    Following the exmaples above you can change the code below like this:
    switch(newUpdate.index){
        case self.uiParameterType.SLIDER_1:
            self.gain = newUpdate.value;
            break;
        case self.uiParameterType.SLIDER_2:
            self.randomness = newUpdate.value;
            break;
        case self.uiParameterType.SWITCH_1:
            self.arpeggioType = newUpdate.value;
            break;

    NOTE: The number that comes after 'self.uiParameterType.SLIDER_' or 'self.uiParameterType.SWITCH_'
          need to match the id of the sliders and switches defined in config_widgets.yaml

    Again, feel free to delete the 'cases' you don't use. 
*/
function updateParameter(newUpdate){
    
    switch(newUpdate.index){
        case self.uiParameterType.SLIDER_1:
            self.temperature = newUpdate.value;
            break;
        case self.uiParameterType.BUTTON_1:
            self.resetState = newUpdate.value;
            break;
        default:
            console.warn("Invalid parameter type");
            break;
    }
}

/*
    If you have any external JSON files, you can load them here. 
    For exmaple :

    await fetch('extraData.json').then(response => {
        return response.json();
    }).then(data => {
        self.extraData = data;
    });
    
    You can always import external *js files using importScripts()
    at the top of agent.js
*/
async function loadExternalFiles(content) {
    // Put your code here
    await fetch('globalTokenIndexDict.json').then(response => {
        return response.json();
    }).then(data => {
        self.tokenIndexDict = data;
    });
}

/*
    In this hook, you can load/initialize your core algorithm/model.
    For example, if your agent is a neural network, you can load the model here.
    
    This is also a good place to warm up your model, if needed.
    Don't forget to send messages to the UI to let it know of the progress. Those 
    progress messages will be shown in the intro screen while the agent is loading.
*/
async function loadAlgorithm(content) {
    
    // A simple example of loading a model with tensorflow.js : 
    tf.setBackend('webgl');
    try {
        self.modelLstm = await tf.loadLayersModel('checkpoints/modelsFinal_Lstm/model.json');
        self.modelEmb =  await tf.loadLayersModel('checkpoints/modelsFinal_Emb/model_cleaned.json');
    } catch (error) {
        console.error(error);
    }
    // Warm up the model if needed
    let midiInp = tf.tensor2d([[96, 96]]);
    let cpcInp = tf.tensor2d([[12, 12]]); 
    let rhyInp = tf.tensor2d([[4]]);
    self.states1A = tf.zeros([1,600]);
    self.states1B = tf.zeros([1,600]);
    self.states2A = tf.zeros([1,600]);
    self.states2B = tf.zeros([1,600]);
    self.first1A = self.states1A;
    self.first1B = self.states1B;
    self.first2A = self.states2A;
    self.first2B = self.states2B;

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
        console.log(inferenceTime);
        // you can sent WARMUP status messages to the UI if you want.
        // these will appear in the intro screen
        postMessage({
            hookType: self.agentHookType.INIT_WORKER,
            message:{
                [self.messageType.STATUS]: 
                        self.statusType.WARMUP,
                [self.messageType.TEXT]: 
                        "BachDuet is warming up. Current round: " + (i + 1) + "/" + self.config.agentSettings.warmupRounds,
            },
        })
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

export { updateParameter, loadAlgorithm, loadExternalFiles};