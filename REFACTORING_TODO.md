# Refactoring - New interaction modes

For the rest of the doc, 'Euterpe' is our framework, and 'Worker' is the system that is hosted in the framework and runs in its own webworker thread.

## What new interaction modes ? 
- polyphonic inputs/outputs
- Event based generation
    -  Models that generate midi-like events (we don't know the note duration untill a note-off event is generated)
    - Models that generate notes+durations at the same time.
- Grid based generation
    - We usually don't know the note duration when they are generated. In BachDuet or any other monophonic systems we know that one note ends when the next starts. But how about polyphonic-grid-based ? The system should generate note-offs, or let Euterpe know when a note is off. 
- Call & Response. (both grid and event)
    - We don't have to do anything in Euterpe for that. The Worker will decide when to be in 'read' mode or 'play' mode. 
- Conditions (i.e chord sequence)
    - We can show the conditions in the scoreUI (chords over the measures).
    - But how about in PianoRoll ? 
        - we need horizontal lines that indicate the measure position
        - then we can add chord info
        


## Why we need refactoring ? 

Currently, Euterpe is very 'BachDuety' oriented. In order to support all the new interaction modes that we want we either need to over-complicate Euterpe, or simplify it and move parts of the interaction logic inside the 'Worker' thread for the developers that want to host their system. The latter is cleaner and simpler for all. 

### Refactoring tasks
- Currently, Euterpe restricts the user's input to be monophonic. This logic will be moved in the 'Worker'. Euterpe will store the user's polyphonic input in a buffer which will be sent to the Worker. The Worker will internally decide how it wants to process this input. 
- The Worker's output will be sent back to Euterpe for playback and midi exporting. However, in the scenario that the Worker needs its previous outputs to generate a new output, Euterpe will not be responsible for repackaging that output and feeding it again as an input to the Worker later. Worker should have an internal storage to keep track of its previous outputs (if needed). 
- Currently, Euterpe sends messages to the Worker every 16th note. This should be more flexible. We can let the developer decide how often this needs to happen (e.g., 8th note, 0.3seconds, etc)
    - Euterpe should also be able communicate with the Worker in irregular time grid, for example whenever there is a new user event (note on, or not off)
    - In any case, the information that Euterpe sends to the Worker are just the buffer with all the new notes the user played since the last communication.
    - The user's input buffer should be erased after every communication
- Even though the PianoRollUI doesn't need any modifications to work, the ScoreUI needs. The truth is that supporting polyphonic score will be too difficult. We will have to basically program from scratch a full notation tool. Hacking our current implementation to support polyphonic visualization will cause overlaping between notes and a cluttered score. 
    - We could have scoreUI available only for monophonic input/output
    - For monophonic ...

## Code cleaning tasks
- I need to have a central place to store constants for Euterpe, and another one for Worker. What's the best method ? 
    - How about a vuex store object for Euterpe and another one for Worker ? (maybe that's too much)
    - Many people suggest making a custom 'constants' plugin. Is there a better way to do it using vuex ? 
        - adding constants in vuex (global-settings.js) needs a getter for each of the constants and we need to write the whole "vm.$store.getters.get..." thing. Maybe a plugin is better ?
    - we need the Euterpe constants to be easily accessible by the developer --> should it be a json ? a YAML ? 
    - tick-number.js replace 16 with a constant
- Firebase code is allover the place. We need to write functions and have them in a central firebase.js file. The developer can activate the firebase functionality if they want, and provide the necessary keys in the YAML file. 
- why using another postMessage from the worker to report the predictTime ? FIXED



## Grid based Template
- variable time signatures
- variable bpm
- variable time-grid 1/4, 1/8, 1/16
- Constants plugin
    - time signature
    - time grid
