const exports = {};

class RecorderWorklet extends AudioWorkletProcessor {
  static get parameterDescriptors(){
    return [{
      name: "recordingStatus",
      defaultValue: 0,
      minValue: 0,
      maxValue: 1,
    }];
  }
  constructor(options) {
    super();
    // Staging buffer to interleave the audio data.
    this.interleaved = new Float32Array(128 * 2); // stereo
    const sab = options.processorOptions;
    this._audio_writer = new AudioWriter(new RingBuffer(sab, Float32Array));
    this.port.onmessage = (e) => {
      console.log("Received from Node" + e.data);
      this.port.postMessage("pong");
    };
  }


  process(inputs, _outputs, _parameters) {
    
    // TODO : if (_parameters.recordingStatus[0] ===1)

    if (inputs[0]) {
      // interleave and store in the queue
      interleave(inputs[0], this.interleaved);
      if (this._audio_writer.enqueue(this.interleaved) !== 256) {
        console.log("underrun: the worker doesn't dequeue fast enough!");
      }
    }
    return true;
  }
}

registerProcessor("recorder-worklet", RecorderWorklet);