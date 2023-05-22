<!-- <template>
    <div>
      <canvas style="display:float" ref="audioCanvas" :width="width" :height="height"></canvas>
    </div>
  </template> -->
<!-- <template>
    <div>
        <canvas
            ref="chroma-chart"
            style="width: 650px; height: 300px; background-color: transparent;"
        ></canvas>
    </div>
</template> -->
<template>
    <div>
      <canvas 
          ref="chromaCanvas"
          :style="{ display: displayType}" 
          :width="width" 
          :height="height">
        </canvas>
    </div>
</template>

  
<script>

  export default {
    name: 'AudioMeter',
    props: {
        displayType: {
            type: String,
            default: "float",
        },
        width: {
            type: Number,
            default: 800,
        },
        height: {
            type: Number,
            default: 100,
        },
        orientation: {
            type: String,
            default: "top",
        },
    },
    data() {
        return {
            dataArray: null,
            chromaChart: null,
            config : {
                type: 'bar',
                data: data,
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                },
            },
        };
    },

    created() {
        this.$root.$refs.chromaChart = this;
    },
    
    mounted() {
        this.init();

    },
    methods: {

        init() {
            
            this.chromaChart = new Chart(canvas.getContext('2d'), this.config);
            // this.dataArray = new Uint8Array(this.bufferLength);
            // this.drawChromaBins();
        },
        updateChart(chromaVector) {
            const data = {
                labels: labels,
                datasets: [{
                    label: 'My First Dataset',
                    data: [65, 59, 80, 81, 56, 55, 40],
                    backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 205, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(201, 203, 207, 0.2)'
                    ],
                    borderColor: [
                    'rgb(255, 99, 132)',
                    'rgb(255, 159, 64)',
                    'rgb(255, 205, 86)',
                    'rgb(75, 192, 192)',
                    'rgb(54, 162, 235)',
                    'rgb(153, 102, 255)',
                    'rgb(201, 203, 207)'
                    ],
                    borderWidth: 1
                }]
            };
            this.chromaChart.data = data;
            // this.chromaChart.data.datasets[0].backgroundColor = KEYS.map((k, i) => `hsl(${PITCH_CLASS_COLORS[k]}, ${scaledHPCP[i]}%, ${25+scaledHPCP[i]/3}%)`);
            // here we call the plotting function to display realtime feature extraction results
            this.chromaChart.update();
        //   } else {
        //     this.chromaChart.data.datasets[0].backgroundColor = KEYS.map((k, i) => `hsl(${PITCH_CLASS_COLORS[k]}, 0%, 25%)`);
        //     this.chromaChart.update();
        }
        // drawChromaBins() {
        //     const vm = this;
        //     const canvas = this.$refs.chromaCanvas;
        //     const drawAlt = function () {
        //         const canvasCtx = canvas.getContext("2d");
        //         canvasCtx.clearRect(0, 0, vm.width, vm.height);
        //         // canvasCtx.beginPath();
        //         // let drawVisual = requestAnimationFrame(drawAlt);
        //         const barWidth = (vm.width / vm.bufferLength);
        //         let barHeight;
        //         let x = 0;
        //         for (let i = 0; i < vm.dataArray.length; i++) {
        //             barHeight = vm.dataArray[i];
        //             var grd = canvasCtx.createLinearGradient(0, 0, 0, 170);
        //             if (vm.orientation === "top"){
        //             grd.addColorStop(0, "rgb(" + (barHeight + 100) + ", 20, 0)")
        //             grd.addColorStop(0.7, "rgb(0, 180, 0)")
        //             canvasCtx.fillStyle = grd;
        //             canvasCtx.fillRect(
        //                 x + 1,
        //                 canvas.height - barHeight / 2,
        //                 barWidth - 2,
        //                 barHeight / 2,
        //             );
        //             } else {
        //             grd.addColorStop(0, "rgb(0, 180, 0)")
        //             grd.addColorStop(0.3, "rgb(" + (barHeight + 100) + ", 20, 0)")
        //             canvasCtx.fillStyle = grd;
        //             canvasCtx.fillRect(
        //                 x + 1,
        //                 0,
        //                 barWidth - 2,
        //                 barHeight / 2,
        //             );
        //             }
        //             x += barWidth + 1;
        //         }
        //         // canvasCtx.closePath();
        //     };
        //     drawAlt();
        // },
    },
  };
  </script>