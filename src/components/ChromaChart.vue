<template>
    <Bar
      :chart-options="chartOptions"
      :chart-data="chartData"
      :chart-id="chartId"
      :dataset-id-key="datasetIdKey"
      :plugins="plugins"
      :css-classes="cssClasses"
      :styles="styles"
      :width="width"
      :height="height"
    />
  </template>
  
  <script>
  import { Bar } from 'vue-chartjs/legacy'
  
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
      width: {
        type: Number,
        default: 400
      },
      height: {
        type: Number,
        default: 400
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
    },

    methods: {
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
  