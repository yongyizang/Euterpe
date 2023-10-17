/*
    This hook is invoked every time a new audio buffer is available
    and it runs on the same thread as the rest of the agent
    so don't do any heavy processing here.
    This hook is only invoked if in config.yaml you have set:
        interactionMode.audioMode: true
    
*/
function processAudioBuffer(buffer) {
    // Put your code here
}