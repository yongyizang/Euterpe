/**
 * This hook is invoked every time a new audio buffer is available
 * and it runs on the same thread as the rest of the agent
 * so don't do any heavy processing here.
 * This hook is only invoked if in config.yaml you have set:
 * interactionMode.audioMode: true
 *
 * @param {Array<Float32Array>} buffer - An array of Float32Array representing
 * audio data.Each Float32Array corresponds to a channel of audio data.
 */
export function processAudioBuffer(buffer) {
    // Put your code here
}
