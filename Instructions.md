
 <!-- The Worker is designed to be a black box, and the UI should not be aware of the internal workings of the Worker. The Worker can be written in any language that compiles to JavaScript, and can be written in any style (e.g., functional, object-oriented, etc.). -->
        
## Directory Structure
### Configuration Files
As referenced in the paper, `public/config.yaml` is the main configuration file that contains the configuration for the entire application, while `src/css/variables.css` denotes the color scheme of the application. 

For further customization, all visual components' CSS files are located in `src/css`, Vue definition in `src/components`, and the main Vue file in `src/views/main.vue`.

### Worker
As defined in our paper, Worker hosts the interaction algorithm. A Worker should be defined as a (Web Worker)[https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers] and should be placed in `public/`. As an example, we have provided a Worker that implements the BachDuet algorithm described in our paper in `public/worker.js`, an audio-based example that aggregate 100 frames of audio then play it back is provided in `public/audio-worker.js`, as well as an empty template worker in `public/template-worker.js`.

Traditionally, the communication between the UI and the Worker is done via the `postMessage` API. However, the `postMessage` API is not designed for real-time communication, and therefore is not suitable for music interaction. Euterpe uses a ring buffer to store the input and output of the Worker, and the UI and the Worker communicate with each other via the ring buffer.


Our goal with Euterpe is to provide a starting point for you to either deploy your music interaction system online. Many of the music interaction algorithms stay in stage of research, running on local machines, innaccessible to the general public. 
Implementing human-computer musical interactions in javascript can be challenging ...
