<template>
    <div ref="mixerTweak" id="mixerTweakId" :width="width" :height="height" 
            style="position: absolute; bottom: 430px; right: 100px">
    </div>
  </template>
  
  <script>
  import {Pane} from 'tweakpane';

  export default {
    name: 'MixerTweak',
    props: {
        dataFromParent: {
            type: Object,
            default: () => {}
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
      },
    data() {
      return {
        paneMixer: null,
        data: null,
  
      };
    },
    created() {
      this.$root.$refs.mixerTweak = this;
      // this.startAnalyser();
      
  
    },
    mounted() {
        let vm = this;
        vm.paneMixer = new Pane({container: vm.$refs.mixerTweak})
        // vm.data = data;
        const f = vm.paneMixer.addFolder({
            title: 'Title',
            expanded: true,
        });
        // let data = {x: 0, y: 1, z: 2};
        // f.addInput(vm.$props.dataFromParent, 'rms');
        // f.addInput(vm.$props.dataFromParent, 'loudness');
        // vm.paneMixer.addInput(
        //     vm.$props.dataFromParent, 'infereceTime',
        //     {min: 0, max: 100, step: 10}
        // );
        f.addMonitor(vm.$props.dataFromParent, 'rms', {
            interval: 30,
            view: 'graph',
            min: 0,
            max: 1,
        });

        // vm.paneMixer.on('change', (ev) => {
        //     console.log('changed: ' + JSON.stringify(ev.value));
        // });
        
        
    },
  
    methods: {
        loadData(data) {
            // vm.data = data;
            // const f = vm.paneMixer.addFolder({
            //     title: 'Title',
            //     expanded: true,
            // });
            // let data = {x: 0, y: 1, z: 2};
            // f.addInput(data, 'x');
            // f.addInput(data, 'y');
            // vm.paneMixer.addInput(
            //     data, 'z',
            //     {min: 0, max: 100, step: 10}
            // );

            // vm.paneMixer.on('change', (ev) => {
            //     console.log('changed: ' + JSON.stringify(ev.value));
            // });
        },
    },
  
  };
  </script>
  <!-- <style>
  :root {
    --tp-base-background-color: hsla(0, 0%, 10%, 0.8);
    --tp-base-shadow-color: hsla(0, 0%, 0%, 0.2);
    --tp-button-background-color: hsla(0, 0%, 80%, 1);
    --tp-button-background-color-active: hsla(0, 0%, 100%, 1);
    --tp-button-background-color-focus: hsla(0, 0%, 95%, 1);
    --tp-button-background-color-hover: hsla(0, 0%, 85%, 1);
    --tp-button-foreground-color: hsla(0, 0%, 0%, 0.8);
    --tp-container-background-color: hsla(0, 0%, 0%, 0.3);
    --tp-container-background-color-active: hsla(0, 0%, 0%, 0.6);
    --tp-container-background-color-focus: hsla(0, 0%, 0%, 0.5);
    --tp-container-background-color-hover: hsla(0, 0%, 0%, 0.4);
    --tp-container-foreground-color: hsla(0, 0%, 100%, 0.5);
    --tp-groove-foreground-color: hsla(0, 0%, 0%, 0.2);
    --tp-input-background-color: hsla(0, 0%, 0%, 0.3);
    --tp-input-background-color-active: hsla(0, 0%, 0%, 0.6);
    --tp-input-background-color-focus: hsla(0, 0%, 0%, 0.5);
    --tp-input-background-color-hover: hsla(0, 0%, 0%, 0.4);
    --tp-input-foreground-color: hsla(0, 0%, 100%, 0.5);
    --tp-label-foreground-color: hsla(0, 0%, 100%, 0.5);
    --tp-monitor-background-color: hsla(0, 0%, 0%, 0.3);
    --tp-monitor-foreground-color: hsla(0, 0%, 100%, 0.3);
  }
  </style> -->