# Euterpe
Euterpe is a web framework designed to bridge the gap between music interaction and creation research and its deployment into user-friendly systems accessible to the general public. It offers a user-friendly interface to deploy music interaction algorithms as static web pages that can run locally on the user's end.
![GitHub last commit](https://img.shields.io/github/last-commit/mrmrmrfinch/Euterpe)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/mrmrmrfinch/Euterpe)

`clean_template` branch is deployed with Netlify at [https://euterpe-template.netlify.app/](https://euterpe-template.netlify.app/).

[![Netlify Status](https://api.netlify.com/api/v1/badges/4c5d3bf5-caaa-4708-900f-15ccf212e525/deploy-status)](https://app.netlify.com/sites/euterpe-template/deploys)

## Features
Euterpe offers several advantages over server-based frameworks, including:

- Increased stability
- Reduced delays
- Lower maintenance costs for the developers

Euterpe supports both symbolic MIDI and audio user input as well as various human-computer interaction paradigms. It defines a music interaction communication protocol (MICP) that allows for flexible communication between Euterpe and the various types of music interaction algorithms it can host.

## Installation and Usage
Euterpe is built on top of Vue.js, therefore need Node.js to be installed on your system. You can download Node.js from [here](https://nodejs.org/en/download/).

Once Node.js is installed, you can install Euterpe by running the following command in the root directory of the project:

    npm install

After the first installation, you can run Euterpe by running the following command in the root directory of the project:

    npm run serve

to start the development server. The development server by default will be available at [http://localhost:8080](http://localhost:8080).

When you are ready to deploy Euterpe, you can run the following command in the root directory of the project:

    npm run build

This will by default generate a `dist` folder in the root directory of the project. You can then deploy the contents of the `dist` folder to your web server.

## Directory Structure
### Configuration Files
As referenced in the paper, `public/config.yaml` is the main configuration file that contains the configuration for the entire application, while `src/css/variables.css` denotes the color scheme of the application. 

For further customization, all visual components' CSS files are located in `src/css`, Vue definition in `src/components`, and the main Vue file in `src/views/main.vue`.

### Worker
As defined in our paper, Worker hosts the interaction algorithm. A Worker should be defined as a (Web Worker)[https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers] and should be placed in `public/`. As an example, we have provided a Worker that implements the BachDuet algorithm described in our paper in `public/worker.js`, an audio-based example that aggregate 100 frames of audio then play it back is provided in `public/audio-worker.js`, as well as an empty template worker in `public/template-worker.js`.
