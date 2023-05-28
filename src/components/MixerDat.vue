<template>
  <div ref="mixerDat" id="mixerDatId" :width="width" :height="height" 
          style="position: absolute; bottom: 430px; right: 20px">
    <!-- <div v-touch:swipe.up="triggerCollapse" id="canvasWrapper">
      <canvas 
          ref="audioCanvas"
          :width="width" 
          :height="height">
      </canvas>
    </div>
    <button type="button" @click="triggerCollapse" id="collapseBtn2">
      <i ref="collapseBtnSymbol2" class="ri-arrow-up-s-line"></i>
    </button> -->
  </div>
</template>

<script>
import "../css/mixerDat.css";
import * as dat from 'dat.gui'

export default {
  name: 'MixerDat',
  props: {
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
    },
  data() {
    return {
      guiMixer: null,

    };
  },
  created() {
    this.$root.$refs.mixerDat = this;
    // this.startAnalyser();
    

  },
  mounted() {
    let vm = this;
    vm.guiMixer = new dat.GUI({ autoPlace: false })
    this.$refs.mixerDat.appendChild(vm.guiMixer.domElement);
    const cubeFolder = vm.guiMixer.addFolder('Cube')
    let data = {x: 0, y: 1, z: 2};
    cubeFolder.add(data, 'x', 0, 10)
    cubeFolder.add(data, 'y', 0, 10)
    cubeFolder.add(data, 'z', 0, 10)
    cubeFolder.open()
    const cameraFolder = vm.guiMixer.addFolder('Camera')
    cameraFolder.add(data, 'z', 0, 10);
    cameraFolder.open()
  },

  methods: {
  },

};
</script>