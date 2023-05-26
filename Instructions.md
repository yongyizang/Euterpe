
 <!-- The Worker is designed to be a black box, and the UI should not be aware of the internal workings of the Worker. The Worker can be written in any language that compiles to JavaScript, and can be written in any style (e.g., functional, object-oriented, etc.). -->
# Start developing with Euterpe

Euterpe is built on Vue.js v2 using its [composition API](https://vuejs.org/guide/introduction.html#api-styles). Even though you don't need to be familiar with Vue.js to use Euterpe, a better understanding of the whole framework will give you better basis for fine tuning your application.

## Directory Structure

The project follows a typical Vue project directory structure:

- `public/`: This folder contains static assets and configuration files used in the project.

    - `audio/`: This directory houses audio samples used in the application. Euterpe assigns one or many Sampler instruments to each player, and this directory contains the audio samples used by the Sampler instruments. (TODOC: how to add new instruments)

    - `img/`: This directory holds image files used in the application (e.g., icons, logos, etc.).

    - `workers/`: This directory contains the Worker files that implmene your music interaction algorithm. Create a new dir in this folder for each Worker you want to implement. Each sub-folder should contain at least the `worker.js` file and a `config.yaml` file. The `worker.js` file is the main file that implements your music interaction algorithm, while the `config.yaml` file contains the configuration the whole app.

    - `libraries/`: This directory contains local copies of third-party libraries used by the Workers. Currently we only need it for importing ringbuf.js

    - `utils.js`: This file includes utility functions files related to the worker. 

    - `recorder-worklet.js`: This file contains the code for the Web Audio API AudioWorklet processor that is used for recording audio in the application.

    - `index.html`: This file serves as the entry point for the Vue.js application. It is the main HTML file that gets loaded in the browser.

- `src/`: This folder contains the source code of the Vue.js application.

    - `components/`: This directory contains the UI Vue components used in the application. Each component is defined in its own file. 

    - `css/`: This directory contains the CSS files used in the application. Each UI Vue component has a corresponding CSS file that defines the styles for that component. 
        - In the `variables.css` file we have isolated the color scheme of the application, so that you can easily change the color scheme of the application by modifying this file.

    - `router/`: Vue router configuration. There is only a single route defined for the root path ("/") that points to the `main.vue` component. 

    - `store/`: This directory contains the Vuex store files used in the application. Each store is defined in its own file. Click [here](TODOC)
    for more details about how we use vuex in this project. 

    - `utils/`: Utility functions used in the application. Some important files are:
        - `types.js`: This file contains the type definitions used in the application. It is used to ensure consistency in the data types used in the application.
        - `NoteEvent.js`: This file contains the definition of the `NoteEvent` class. This is a MIDI based representation, augmented with extra fields useful for music interaction.
        - `widgets_config.js`: In this file you can define the widgets that you want to appear in the settings model of your application. Currently only buttons, sliders, and switches are supported. 
        - `instruments.js`: Helper functions to create Tone.js sampler instruments. (TODOC : how to add new instruments)

    - `views/`: 
        - `main.vue`: The main file of the app. It contains most of the functionality of Euterpe including receiving and processing user events and communicating with the Worker and the UI elements.

    - `App.vue`: TODOC

    - `main.js`: TODOC



- `configuration.yaml`: This file stores the configuration settings for the application. It holds customizable parameters, options, or preferences that affect the behavior of the application. You can modify this file to adjust the app's settings according to your needs.

The main files that you need to be aware of are:
### Configuration Files
As referenced in the paper, `public/config.yaml` is the main configuration file that contains the configuration for the entire application, while `src/css/variables.css` denotes the color scheme of the application. 

For further customization, all visual components' CSS files are located in `src/css`, Vue definition in `src/components`, and the main Vue file in `src/views/main.vue`.

### Worker
As defined in our paper, Worker hosts the interaction algorithm. A Worker should be defined as a (Web Worker)[https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers] and should be placed in `public/`. As an example, we have provided a Worker that implements the BachDuet algorithm described in our paper in `public/worker.js`, an audio-based example that aggregate 100 frames of audio then play it back is provided in `public/audio-worker.js`, as well as an empty template worker in `public/template-worker.js`.

Traditionally, the communication between the UI and the Worker is done via the `postMessage` API. However, the `postMessage` API is not designed for real-time communication, and therefore is not suitable for music interaction. Euterpe uses a ring buffer to store the input and output of the Worker, and the UI and the Worker communicate with each other via the ring buffer.


Our goal with Euterpe is to provide a starting point for you to either deploy your music interaction system online. Many of the music interaction algorithms stay in stage of research, running on local machines, innaccessible to the general public. 
Implementing human-computer musical interactions in javascript can be challenging ...
