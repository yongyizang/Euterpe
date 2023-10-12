<template>
  <div ref="vectorBar" id="vectorBar" style="position: absolute; ">
    <div v-touch:swipe.up="triggerCollapse" id="canvasWrapperVectorBar">
      <canvas 
          ref="vectorBarCanvas"
          :width="width" 
          :height="height">
      </canvas>
    </div>
    <button type="button" @click="triggerCollapse" id="collapseBtnVectorBar">
      <i ref="collapseBtnSymbol2" class="ri-arrow-up-s-line"></i>
    </button>
  </div>
</template>

<script>
import "../css/vectorBar.css";

export default {
  name: 'VectorBar',
  props: {
    width: {
      type: Number,
      default: 800,
    },
    height: {
      type: Number,
      default: 100,
    },
    num_bars: {
      type: Number,
      default: 12,
    },
    orientation: {
      type: String,
      default: "top",
    },
  },
  data() {
    return {
      // audioContext: null,
      // analyserNode: null,
      // dataArray: null,
      // bufferLength: null,
      chartData: null,
      chartOptions: null,
    };
  },
  created() {
    this.$root.$refs.vectorBar = this;
    // this.startAnalyser();
    this.init();
  },
  methods: {

    init() {
      // this.analyserNode = analyser;
      // this.analyserNode.fftSize = this.num_bars;
      // this.bufferLength = this.analyserNode.frequencyBinCount; // half of FFT size
      this.dataArray = new Uint8Array(this.num_bars);
      console.log('VectorBar initialized');
    },

    triggerCollapse() {
      const btnSymbol = this.$refs.collapseBtnSymbol2.classList;
      const score = this.$refs.vectorBar;
      const scoreClass = score.classList;
      console.log("in colapse")
      if (scoreClass.contains("slide-up-vectorbar")) {
        console.log("skata up")
        scoreClass.replace("slide-up-vectorbar", "slide-down-vectorbar");
        btnSymbol.replace("ri-arrow-down-s-line", "ri-arrow-up-s-line");
      } else if (scoreClass.contains("slide-down-vectorbar")) {
        console.log("skata down")
        scoreClass.replace("slide-down-vectorbar", "slide-up-vectorbar");
        btnSymbol.replace("ri-arrow-up-s-line", "ri-arrow-down-s-line");
      } else {
        scoreClass.add("slide-up-vectorbar");
        btnSymbol.replace("ri-arrow-up-s-line", "ri-arrow-down-s-line");
      }
    },
    
    // updateVectorData(vectorData){
    //   this.dataArray = vectorData;
    //   this.drawFrequencyBins();
    // },
    
    updateAnalysis() {
      requestAnimationFrame(this.updateAnalysis);
      
      // Generate some random data for dataArray for now
      for (let i = 0; i < this.dataArray.length; i++) {
        this.dataArray[i] = Math.random() * 100;
      }
      this.drawFrequencyBins();
    },

    drawFrequencyBins() {
      const vm = this;
      if (!this.$refs.vectorBarCanvas) {
        return;
      }
      const canvas = this.$refs.vectorBarCanvas;
      // const drawAlt = function () {
        const canvasCtx = canvas.getContext("2d");
        canvasCtx.clearRect(0, 0, vm.width, vm.height);
        // canvasCtx.beginPath();
        // let drawVisual = requestAnimationFrame(drawAlt);
        const barWidth = (vm.width / vm.num_bars);
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
      // };
      // drawAlt();
    },
  },
};
</script>