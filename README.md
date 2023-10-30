# Euterpe
Euterpe is a framework designed to bridge the gap between music interaction and creation research and its deployment into user-friendly systems accessible to the general public on the web. Euterpe aims to be a template or starting point, from which you can develop your own music interaction system.

## Deployed Systems Using Euterpe
- [BachDuet]()
- [PianoGenie]()
- [Copycat]()
- [GridyCopycat]()
- [CallAndResponse]()
- [MeydaDemo]()
- [JazzTrio]()


## Features

### UI 
    
The UI is the main thread of Euterpe and it performs the following operations:
- Receiving and displaying the user input (e.g., PianoRoll, Score, etc.)
- Processing input and sending it to your music interaction algorithm
- Receiving the output from your music interaction algorithm and displaying it to the user

### Agent 

The Agent is a separate thread that hosts your music interaction algorithm.
The Agent receives input from the UI in a timely manner, and sends back its output to the UI.
    
### Music Interaction Communication Protocol (MICP)

The communication protocol that both UI and the Agent need to adhere to in order to communicate with each other. The protocol is designed to support various types of music interaction modes and data types:
- Time-grid based (e.g., 16th-note quantization algorithms)
- Event-based
- 'Simultaneous' or 'Call and Response' playing
- MIDI, Audio and data transfering
---

## Installation
Euterpe is built on top of Vue.js, therefore need Node.js to be installed on your system. You can download Node.js from [here](https://nodejs.org/en/download/).

Once Node.js is installed, you can install Euterpe by running the following command in the root directory of the project:

```sh
npm install
```

## Usage
After the first installation, you can run Euterpe by running the following command in the root directory of the project to start the development server:

```sh
npm run dev
```

 The development server by default will be available at [http://localhost:5173](http://localhost:5173).

## Deployment

When you are ready to deploy Euterpe, you can run the following command in the root directory of the project:
```sh
npm run build
```

This will by default generate a `dist` folder in the root directory of the project. You can then deploy the contents of the `dist` folder to your web server.

---
## Made with 
- [Vue.js](https://vuejs.org/)
- [WebAudio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Tone.js](https://tonejs.github.io/)
- [ringbuf.js](https://github.com/padenot/ringbuf.js/)
- [tonaljs](tonaljs)
- [audiokeys](https://github.com/kylestetz/AudioKeys)
- [vexflow]()
- [three.js](https://threejs.org/)
- [vue-chartjs](https://vue-chartjs.org/)



