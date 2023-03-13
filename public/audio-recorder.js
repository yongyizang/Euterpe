class AudioRecorder extends AudioWorkletProcessor {
    static get parameterDescriptors () { // <1>
      return [
        {
          name: 'recordingStatus',
          defaultValue: 0,
          minValue: 0,
          maxValue: 1,
        },
      ]
    }
  
    process (inputs, outputs, parameters) {
      const channel = 0
      if (parameters.isRecording[0] === 1) {
        this.port.postMessage(inputs[channel][0]);
      }
      return true;
    }
  }
  
  registerProcessor('audio-recorder', AudioRecorder) // <4>