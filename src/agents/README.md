# Musical Agents

## Agent Files
Agent-specific files are located in `src/agents/{agentName}/`:
- `agent.js`: This is the main agent script that Euterpe calls to initialize the agent. It includes boilerplate code for the basic audio and MIDI functionalities of the agent and determines which hook to invoke based on messages received from Euterpe.

- `initAgent_hook.js`: This file contains hook functions, such as `loadAlgorithm()`, and `loadExternalFiles()`. These hooks are invoked only at the beginning of the agent's lifecycle.

- `processAudioBuffer_hook.js`: This file houses a single hook function to process an audio buffer. It's invoked every time a new audio buffer is received from Euterpe.

- `processNoteEvent_hook.js`: In this file, you'll find a single hook function to process a note event. It's invoked whenever a new note event is received by the user.

- `processClockEvent_hook.js`: This file contains a single hook function to process a clock event, which is triggered each time a new clock event is received from Euterpe in the grid-based interaction mode.

- `config.yaml`: A configuration file for the agent, including the agent's name, description, and a list of the agent's characteristics in terms of its interaction mode paradigm (e.g. audio, note, event-based, grid-based etc).

- `config_widgets.yaml`: This file handles the agent's widgets and their configurations, specifying which widgets to use and how they should be displayed.

- `config_players.yaml`: This file defines the players, instruments, and samplers available to each of them. Note that we also include the 'metronome' as a separate player.


## Examples

In the directory where you cloned or downloaded the `Euterpe` code, you should find an empty template agent located in `src/agents/`, named **EmptyAgent**. This is the starting point for creating your own agent. 

Additionally we provide some examples of already implemented agents in the same folder to demonstrate the various interaction paradigms supported in Euterpe.
- **GridyCopycat**
    - This is an agent that copies the user's input with a delay set by a slider. It's a monophonic 16th note grid-based interaction where both PianoRoll and the Score are used to visualize the musical interaction.
- **CallAndResponse**
    - This is an agent that engages with a user in a free-time event-based call and response interaction. The agent waits for the user to finish their 'call' before responding with a 'response' of that mimics the user's input.
- **WhistleToChords**
    - This is an agent that listens to you whistling and generates chord accompaniment based on basic rules. We built this agent to demonstrate the audio input capabilities of Euterpe. It takes audio input from the microphone and estimates and displays audio features (rms and chroma vector) using the [Meyda](https://meyda.js.org/) library. 
- **PianoGenie**
    - This a re-implementation of the [Piano Genie](https://magenta.tensorflow.org/pianogenie) by Google Magent, using Euterpe. It's an neural-network agent that has the role of an intelligent musical instrument. The user can only use 8 buttons to play the piano, but the agent can generate a full 88-key piano performance.
- **BachDuet**
    - [BachDuet](https://labsites.rochester.edu/air/projects/BachDuet.html) is a musical agent that can play a counterpoint duet with the user in the style of J.S. Bach. It's a monophonic grid-based interaction.