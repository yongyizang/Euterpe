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


// Global ui-parameters shared with the other hooks and the agent.js
self.temperature = 0.25;
self.bypass = 0;

// Neural Network related variables
self.genie = null;
const totalNotes = 88; 
self.keyWhitelist = Array(totalNotes).fill().map((x,i) => {
    return i;
});
const GENIE_CHECKPOINT = 'https://storage.googleapis.com/magentadata/js/checkpoints/piano_genie/model/epiano/stp_iq_auto_contour_dt_166006'; 

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
            console.log("temperature is " + self.temperature);
            break;
        case self.uiParameterType.SWITCH_1:
            self.bypass = newUpdate.value;
            console.log("bypass is " + self.bypass);
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
    // tf.setBackend('webgl');
    // try {
    //     self.model = await tf.loadLayersModel('Checkpoints/model.json');
    // } catch (error) {
    //     console.error(error);
    // }
    // const mvae = new mm.music_vae.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_2bar_small');
    // await mvae.initialize();
    // self.genie = new piano_genie.PianoGenie(GENIE_CHECKPOINT);
    // await self.genie.initialize();

    try {
        self.genie = new piano_genie.PianoGenie(GENIE_CHECKPOINT);
        await self.genie.initialize();
    } catch (error) {
        console.error(error);
    }
    
    // Warm up the model
    let inferenceTimes = [];
    for (let i = 0; i < self.config.agentSettings.warmupRounds; i++) {
        let start = performance.now();

        let note = self.genie.nextFromKeyList(0, keyWhitelist, self.temperature);

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
                        "PianoGenie is warming up. Current round: " + (i + 1) + "/" + self.config.agentSettings.warmupRounds,
            },
        })
    }
    self.genie.resetState();

    console.log("Average inference time: " + inferenceTimes.reduce((a, b) => a + b, 0) / inferenceTimes.length);
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