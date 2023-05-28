<template>
    <div ref="monitor" id="monitorId" :width="width" :height="height" 
            style="position: absolute; bottom: 430px; right: 20px">
    </div>
  </template>
  
  <script>
  import {Pane} from 'tweakpane';

  export default {
    name: 'Monitor',
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
            pane: null,
            data: null,
            structure: null,
            title: "",
        };
    },
    beforeCreate(){
        console.log("beforeCreate monitor start")
        // this.$root.$refs.monitor = this;
        console.log("beforeCreate monitor end")
    },
    created() {
        console.log("created monitor start")
        this.$root.$refs.monitor = this;
        // this.startAnalyser();
        console.log(" created monitor end")
    },
    mounted() {
        console.log("mounted monitor start")

        
        
        
    },
  
    methods: {
        loadMonitorConfig(monitorConfig) {
            let vm = this;
            vm.structure = monitorConfig.structure;
            vm.title = monitorConfig.title;

            vm.pane = new Pane({
              container: vm.$refs.monitor,
              title: vm.title,
            })
            // vm.data = data;
            // const f = vm.pane.addFolder({
            //     title: vm.title,
            //     expanded: true,
            // });
            // vm.pane.on('change', (ev) => {
            //     console.log('changed: ' + JSON.stringify(ev.value));
            // });

            // Iterate over the structure in the config file
            vm.structure.forEach((tab) => {
            // Create a folder for each tab
                const folder = vm.pane.addFolder({
                    title: tab.label,
                    expanded: true,
                });

                // Iterate over the parameters in each tab
                tab.parameters.forEach((parameter) => {
                    // Add a monitor for each parameter
                    folder.addMonitor(vm.$props.dataFromParent, parameter.id, {
                        label: parameter.label,
                        interval: parameter.interval,
                        view: parameter.graph ? 'graph' : 'text',
                        min: parameter.min,
                        max: parameter.max,
                    });
                });
            });
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