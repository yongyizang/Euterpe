<template>
  <div ref="audioMeter" id="audioMeter">
    <div v-touch:swipe.up="triggerCollapse" id="canvasWrapper">
      <canvas 
          ref="audioCanvas"
          :width="width" 
          :height="height">
      </canvas>
    </div>
    <button type="button" @click="triggerCollapse" id="collapseBtn2">
      <i ref="collapseBtnSymbol2" class="ri-arrow-up-s-line"></i>
    </button>
  </div>
</template>

<script>
import "../css/audioMeter.css";

export default {
  name: 'AudioMeter',
  props: {
    width: {
      type: Number,
      default: 800,
    },
    height: {
      type: Number,
      default: 100,
    },
    fft_bins: {
      type: Number,
      default: 256,
    },
    orientation: {
      type: String,
      default: "top",
    },
  },
  data() {
    return {
      audioContext: null,
      analyserNode: null,
      dataArray: null,
      bufferLength: null,
    };
  },
  created() {
    this.$root.$refs.audioMeter = this;
    this.startAnalyser();
  },
  methods: {

    triggerCollapse() {
      const btnSymbol = this.$refs.collapseBtnSymbol2.classList;
      const score = this.$refs.audioMeter;
      const scoreClass = score.classList;
      console.log("in colapse")
      if (scoreClass.contains("slide-up")) {
        console.log("skata up")
        scoreClass.replace("slide-up", "slide-down");
        btnSymbol.replace("ri-arrow-down-s-line", "ri-arrow-up-s-line");
      } else if (scoreClass.contains("slide-down")) {
        console.log("skata down")
        scoreClass.replace("slide-down", "slide-up");
        btnSymbol.replace("ri-arrow-up-s-line", "ri-arrow-down-s-line");
      } else {
        scoreClass.add("slide-up");
        btnSymbol.replace("ri-arrow-up-s-line", "ri-arrow-down-s-line");
      }
    },

    startAnalyser() {
      console.log('Starting analyser');
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyserNode = this.audioContext.createAnalyser();
      }

      this.analyserNode.fftSize = this.fft_bins;
      this.bufferLength = this.analyserNode.frequencyBinCount; // half of FFT size
      this.dataArray = new Uint8Array(this.bufferLength);

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          const source = this.audioContext.createMediaStreamSource(stream);
          source.connect(this.analyserNode);
          this.updateAnalysis();
        })
        .catch((error) => {
          console.error('Error capturing audio.', error);
        });
    },
    
    updateAnalysis() {
      requestAnimationFrame(this.updateAnalysis);
      this.analyserNode.getByteFrequencyData(this.dataArray);
      this.drawFrequencyBins();
    },

    drawFrequencyBins() {
      const vm = this;
      const canvas = this.$refs.audioCanvas;
      const drawAlt = function () {
        const canvasCtx = canvas.getContext("2d");
        canvasCtx.clearRect(0, 0, vm.width, vm.height);
        // canvasCtx.beginPath();
        // let drawVisual = requestAnimationFrame(drawAlt);
        const barWidth = (vm.width / vm.bufferLength);
        let barHeight;
        let x = 0;
        for (let i = 0; i < vm.dataArray.length; i++) {
          barHeight = vm.dataArray[i];
          var grd = canvasCtx.createLinearGradient(0, 0, 0, 170);
          if (vm.orientation === "top"){
            grd.addColorStop(0, "rgb(" + (barHeight + 100) + ", 20, 0)")
            grd.addColorStop(0.7, "rgb(0, 180, 0)")
            canvasCtx.fillStyle = grd;
            canvasCtx.fillRect(
              x + 1,
              canvas.height - barHeight / 2,
              barWidth - 2,
              barHeight / 2,
            );
          } else {
            grd.addColorStop(0, "rgb(0, 180, 0)")
            grd.addColorStop(0.3, "rgb(" + (barHeight + 100) + ", 20, 0)")
            canvasCtx.fillStyle = grd;
            canvasCtx.fillRect(
              x + 1,
              0,
              barWidth - 2,
              barHeight / 2,
            );
          }
          x += barWidth + 1;
        }
        // canvasCtx.closePath();
      };
      drawAlt();
    },
  },
};
</script>