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
    
      },
    };
</script>
