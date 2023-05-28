<template>
    <div ref="mixer" id="mixerId" :width="width" :height="height" 
            style="position: absolute; top: 150px; left: 20px; z-index: 100">
    </div>
  </template>
  
  <script>
  import {Pane} from 'tweakpane';

  export default {
    name: 'Mixer',
    props: {
        // dataFromParent: {
        //     type: Object,
        //     default: () => {}
        // },
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
            data: [],
            playersConfig: null,
            title: "",
        };
    },
    beforeCreate(){
        console.log("beforeCreate mixer start")
        // this.$root.$refs.mixer = this;
        console.log("beforeCreate mixer end")
    },
    created() {
        console.log("created mixer start")
        this.$root.$refs.mixer = this;
        // this.startAnalyser();
        console.log(" created mixer end")
    },
    mounted() {
        console.log("mounted mixer start")
    },
  
    methods: {
        loadMixerConfig(playersConfig) {
            let vm = this;
            vm.playersConfig = playersConfig;
            // vm.title = mixerConfig.title;

            vm.pane = new Pane({
              container: vm.$refs.mixer,
              title: 'Mixer',
            })
            // vm.pane.on('change', (ev) => {
            //     console.log('changed: ' + JSON.stringify(ev.value));
            // });
            
            vm.playersConfig.forEach((player) => {
                let playerName = player.label;
                vm.data[`${playerName}mute`] = player.mute;
                vm.data[`${playerName}volume`] = player.volume;
                player.instruments.forEach((instrument) => {
                    vm.data[`${playerName}${instrument.name}mute`] = instrument.mute;
                    vm.data[`${playerName}${instrument.name}volume`] = instrument.volume;
                });
            });

            // Iterate over the structure in the config file
            vm.playersConfig.forEach((player) => {
            // Create a folder for each tab
                const playerFolder = vm.pane.addFolder({
                    title: player.label,
                    expanded: true,
                });
                
                let playerName = player.label;
                playerFolder.addInput(vm.data, `${playerName}volume`,
                {
                    label: "volume",
                    min: 1,
                    max: 10
                });
                playerFolder.addInput(vm.data, `${playerName}mute`,
                {
                    label: "mute",
                });

                console.log("instuments for player " + player.label + " are " + player.instruments)
                player.instruments.forEach((instrument) => {
                    console.log(instrument.name);
                    // player.instruments.forEach((instrument) => {
                    const instFolder = playerFolder.addFolder({
                        title: instrument.name,
                        // expanded: true,
                    });
                    console.log("added sub")
                    instFolder.addInput(vm.data, `${playerName}${instrument.name}volume`,
                    {
                        label: "mute",
                        min: 1,
                        max: 10
                    });
                    instFolder.addInput(vm.data, `${playerName}${instrument.name}mute`,
                    {
                        label: "mute",
                    });
                    // });
                });
            });
        },
        updateData() {
            // Modify the local copy of the propData and emit an event
            this.propData = 'Updated Data';
            this.$emit('update-data', this.propData);
        }
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
    --tp-mixer-background-color: hsla(0, 0%, 0%, 0.3);
    --tp-mixer-foreground-color: hsla(0, 0%, 100%, 0.3);
  }
  </style> -->