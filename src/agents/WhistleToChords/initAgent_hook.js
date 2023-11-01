/**
 * This file contains variable initializations as well as
 * the first set of hook functions that are invoked by
 * the UI to initialize the agent.
 */

/* Variable initialization */

/**
 * NOTE:
 * - Global variables shared between the agent.js and the hooks
 *   need to be declared using the self keyword
 * - Local variables can be declared using the let keyword (or const)
 *
 * You should also initialize the Agent parameters that are controllable
 * by UI elements. Those UI elements are defined in config_widgets.yaml
 * under the settingsModal section.
 *
 * You can change their names to match your agent's parameters,
 * e.g.: slider1 --> randomness,
 *      switch1 --> arpeggioType
 *      e.t.c
 */
self.slider1 = 0;
self.switch1 = false;

/**
 * This function is invoked every time there is a change in the UI parameters.
 * This is where the mapping of the UI widgets to the worker parameters happens.
 * Following the examples above, you can change the code below like this:
 * switch (newUpdate.index) {
 *     case self.uiParameterType.SLIDER_1:
 *         self.slider1 = newUpdate.value;
 *         break;
 *     case self.uiParameterType.SWITCH_1:
 *         self.switch1 = newUpdate.value;
 *         break;
 *     case self.uiParameterType.BUTTON_1:
 *         // call the reset function
 *         resetAgent();
 *         break;
 *
 * NOTE: The number that comes after 'self.uiParameterType.SLIDER_',
 * 'self.uiParameterType.SWITCH_' or 'self.uiParameterType.BUTTON_'
 * should match the id of the sliders, switches, and buttons
 * defined in config_widgets.yaml.
 *
 * Again, feel free to delete the 'cases' you don't use.
 *
 * @param {object} newUpdate - An object containing information about the UI parameter update.
 */
export function updateParameter(newUpdate) {
    switch (newUpdate.index) {
    case self.uiParameterType.SLIDER_1:
        self.slider1 = newUpdate.value;
        break;
    case self.uiParameterType.SWITCH_1:
        self.switch1 = newUpdate.value;
        break;
    case self.uiParameterType.BUTTON_1:
        // Call a function here. For example:
        // callbackForButton1();
        break;
    default:
        console.warn('Invalid parameter type');
        break;
    }
}


/**
 * If you have any external JSON files, you can load them here.
 *
 */
export async function loadExternalFiles() {
    await fetch('chord_histograms_majmin.json').then(response => {
        return response.json();
    }).then(data => {
        self.chordDict = data;
    });
}

/**
 * In this hook, you can load/initialize your core algorithm/model.
 * For example, if your agent is a neural network, you can load the model here.
 *
 * This is also a good place to warm up your model if needed.
 * Don't forget to send messages to the UI to let it know of the progress. Those
 * progress messages will be shown in the intro screen while the agent is loading.
 *
 */
export async function loadAlgorithm() {
    // A simple example of loading a model with TensorFlow.js:
    // tf.setBackend('webgl');
    // try {
    //     self.model = await tf.loadLayersModel('Checkpoints/model.json');
    // } catch (error) {
    //     console.error(error);
    // }
    // Or loading a model with Magenta.js:
    // self.model = new piano_genie.PianoGenie(GENIE_CHECKPOINT);
    // await self.model.initialize();

    // Optional message for the Euterpe/UI
    // postMessage({
    //     hookType: self.agentHookType.INIT_AGENT,
    //     message:{
    //         [self.messageType.STATUS]:
    //                 self.statusType.LOADED,
    //         [self.messageType.TEXT]:
    //                 "Core algorithm is loaded",
    //     },
    // })

    // Warm up the model if needed
    // for (let i = 0; i < self.config.agentSettings.warmupRounds; i++) {
    //     // Put your code here for warming up the model

    //     // Optional message for the Euterpe/UI
    //     postMessage({
    //         hookType: self.agentHookType.INIT_AGENT,
    //         message:{
    //             [self.messageType.STATUS]:
    //                     self.statusType.WARMUP,
    //             [self.messageType.TEXT]:
    //                     "Agent is warming up: " + (i + 1) + "/" +
    //                     self.config.agentSettings.warmupRounds,
    //         },
    //     })
    // }

    // Once your model/agent is ready to play,
    // the UI expects a success message, don't forget to send it.
    postMessage({
        hookType: self.agentHookType.INIT_AGENT,
        message: {
            [self.messageType.STATUS]:
                    self.statusType.SUCCESS,
            [self.messageType.TEXT]:
                    'The Agent is ready to interact with you!',
        },
    });
}
