<template>

  <div ref="testBar" id="testBar" 
    style="position: absolute; top: 5px; left: 20px; 
    height:300px; width:300px"
  >
    <!-- <div v-touch:swipe.up="triggerCollapse" id="canvasWrapper"> -->
      <canvas 
          ref="testBarCanvas"
            
          >
      </canvas>
    <!-- </div> -->
    <!-- <button type="button" @click="triggerCollapse" id="collapseBtnTestBar">
      <i ref="collapseBtnSymbol2" class="ri-arrow-up-s-line"></i>
    </button> -->
  </div>
</template>

<script>
    import Chart from 'chart.js/auto';
    import "../css/audioMeter.css";

    export default {
        name: 'TestBar',
      data() {
        return {
          chart: null,
        };
      },
      created() {
        this.$root.$refs.testBar = this;
        // this.startAnalyser();
      },
      
      mounted() {
        // Get the canvas element by its ref
        // const ctx = this.$refs.chartCanvas.getContext('2d');
        // const ctx = document.getElementById('testBar').getContext('2d');
        // const ctx = document.getElementById('testBarCanvas').getContext('2d');
        const ctx = this.$refs.testBarCanvas.getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
                label: '# of Votes',
                data: [12, 19, 3, 5, 2, 3],
                borderWidth: 1
            }]
            },
            options: {
            scales: {
                y: {
                beginAtZero: true
                }
            }
            }
        });
        console.log("CREAFEOIJEAFOUHEACOUAOAUEJ\n\n\n\n\n\n\n\n");

    
        // Chart.js configuration
        // const chartData = {
        //   type: BarElement,
        //   data: {
        //     labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        //     datasets: [
        //       {
        //         label: '# of Votes',
        //         data: [12, 19, 3, 5, 2, 3],
        //         backgroundColor: [
        //           'rgba(255, 99, 132, 0.2)',
        //           'rgba(54, 162, 235, 0.2)',
        //           'rgba(255, 206, 86, 0.2)',
        //           'rgba(75, 192, 192, 0.2)',
        //           'rgba(153, 102, 255, 0.2)',
        //           'rgba(255, 159, 64, 0.2)',
        //         ],
        //         borderColor: [
        //           'rgba(255, 99, 132, 1)',
        //           'rgba(54, 162, 235, 1)',
        //           'rgba(255, 206, 86, 1)',
        //           'rgba(75, 192, 192, 1)',
        //           'rgba(153, 102, 255, 1)',
        //           'rgba(255, 159, 64, 1)',
        //         ],
        //         borderWidth: 1,
        //       },
        //     ],
        //   },
        //   options: {
        //     scales: {
        //       y: {
        //         beginAtZero: true,
        //       },
        //     },
        //   },
        // };
    
        // // Create the chart
        // this.chart = new ChartJS(ctx, chartData);
      },
    };
</script>
