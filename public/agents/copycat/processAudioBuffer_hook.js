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
    /*
    The audio buffer has 2 channels (stereo), buffer[0] and buffer[1]
    The buffers that processAudioBuffer receives are of size windowSize (config.yaml)
    And they are overlaped according to the hopSize (config.yaml)
    */

    // Υou can use Meyda to extract audio features from the left channel
    // let features = Meyda.extract(['rms', 'chroma'], buffer[0]);

    /*
    Υou have the option to send those features to the UI for visualization.
    Since these features are estimated many times per second,
    it's better to push them to the sharedArrayBuffer queue that
    the agent shares with the UI, instead of sending them
    using postMessage(). Note that you can only use this way of
    communication to send single float values.

    The values you send through the queue will be shown
    in the Monitor widget (GUI). Make sure you have first declared them
    in config_widgets.yaml
    The first arg for enqueue_change is the parameter id (see config_widgets.yaml)
    and the second arg is the float value you want to send.
    */

    // self.param_writer.enqueue_change(0, features.rms);

    /*
    Here we push the overlapped audio frames and their features
    to the local queues. This is useful for agents that process both MIDI
    and  audio inputs at the same time as these queues can be accessed from both
    processClockEvent() and processNoteEvent() hooks.
    */

    // self.audio_frames_queue.push(buffer[0]);
    // self.audio_features_queue.push(features);
}
