<template>
    <div
        :ref="ref_c"
        :id="id_c"
        :style="{
        position: `${position}`,
        top: `${top}px`,
        right: `${right}px`,
        zIndex: 100,
        width: `${width}px`, 
        height: `${height}px`,
        // ...styles,
        }"
    >
    <div v-touch:swipe.up="triggerCollapse" id="canvasWrapperVectorBar">
      <Bar
        :chart-options="chartOptions"
        :chart-data="chartData"
        :chart-id="chartId"
        :dataset-id-key="datasetIdKey"
        :plugins="plugins"
        :css-classes="cssClasses"
        :width="width"
        :height="height"
      />
      <!-- :styles="styles"
        :width="width"
        :height="height" -->
      </div>
      <button type="button" @click="triggerCollapse" id="collapseBtnVectorBar">
        <i ref="collapseBtnSymbol2" class="ri-arrow-up-s-line"></i>
      </button>
    
  
  </div>

  
  
  </template>
  
  <script>
  import { Bar } from 'vue-chartjs/legacy'
  import "../css/vectorBar.css";

  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale
  } from 'chart.js'
  
  ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

  export default {
    name: 'ChromaChart',
    components: {
      Bar
    },

    props: {
      chartId: {
        type: String,
        default: 'bar-chart'
      },
      datasetIdKey: {
        type: String,
        default: 'label'
      },
      ref_c: {
            type: String,
            default: 'chromaChart'
        },
        id_c: {
            type: String,
            default: 'chromaId'
        },
        position: {
            type: String,
            default: 'absolute'
        },
        top: {
            type: Number,
            default: 0
        },
        right: {
            type: Number,
            default: 0
        },
      width: {
        type: Number,
        default: 400
      },
      height: {
        type: Number,
        default: 100
      },
      cssClasses: {
        default: '',
        type: String
      },
      styles: {
        type: Object,
        default: () => {}
      },
      plugins: {
        type: Array,
        default: () => []
      }
    },

    data() {
      return {
        chartData: null,
        chartOptions: null,
      }
    },
    
    created() {
        this.$root.$refs.chromaChart = this;
        this.init();
    },
    
    mounted() {
      // this.width = 300;
      // this.height = 300; 
      console.log("mounted chromaChart start/end")
      this.triggerCollapse();
    },

    methods: {
      triggerCollapse() {
        let btnSymbol = this.$refs.collapseBtnSymbol2.classList;
        let score = this.$refs.chromaChart;
        let scoreClass = score.classList;
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

      init() {
        this.chartData = {
          labels: ['C','C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A','A#', 'B'],
          datasets: [
            {
                label: 'chromaData',
                backgroundColor: '#e6a100',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            }
          ]
        };
        this.chartOptions = {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
              x: {
                  display: true 
              },
              y: {
                  display: false 
              }
          },
          plugins: {
              legend: {
                  display: false  
              },
              title: {
                  display: false,
                  text: 'Chromagram'
              }
          }

        };
      },
      updateChromaData(chromaData) {
          this.chartData.datasets[0].data = chromaData;
      }
    },
  }
  </script>
  