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
            data2: {},
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
            // vm.data2 = vm.playersConfig;

            vm.pane = new Pane({
              container: vm.$refs.mixer,
              title: 'Mixer',
            })
            // vm.pane.on('change', (ev) => {
            //     console.log('changed: ' + JSON.stringify(ev.value));
            // });
            
            for (const [player, playerData] of Object.entries(vm.playersConfig)) {
                // let playerName = player.label;
                // vm.data[`${playerName}mute`] = player.mute;
                // vm.data[`${playerName}volume`] = player.volume;
                vm.data2[`${player}`] = {
                    label: playerData.label,
                    mute: playerData.mute,
                    volume: playerData.volume,
                    instruments: {}
                };
                playerData.instruments.forEach((instrument) => {
                    console.log(instrument.id + " " + instrument.label)
                    vm.data2[`${player}`].instruments[`${instrument.id}`] = {
                        label: instrument.label,
                        mute: instrument.mute,
                        volume: instrument.volume,
                    };
                    // vm.data[`${playerName}${instrument.name}mute`] = instrument.mute;
                    // vm.data[`${playerName}${instrument.name}volume`] = instrument.volume;
                });
            };

            // Iterate over the 'players' in the config file
            for (const [player, playerData] of Object.entries(vm.data2)) {
                console.log(player, " ", playerData);
                const playerFolder = vm.pane.addFolder({
                    title: playerData.label,
                    expanded: true,
                });
                playerFolder.addInput(vm.data2[player], 'volume',
                    {
                        label: "vol.",
                        min: 1,
                        max: 10
                    });
                playerFolder.addInput(vm.data2[player], 'mute',
                    {
                        label: "mute",
                    });
                for (const [instId, instData] of Object.entries(playerData.instruments)) {
                    console.log(instData.label);
                    // player.instruments.forEach((instrument) => {
                    const instFolder = playerFolder.addFolder({
                        title: instData.label,
                        expanded: false,
                    });
                    console.log("added sub")
                    instFolder.addInput(vm.data2[player].instruments[instId], 'volume',
                    {
                        label: "vol.",
                        min: 1,
                        max: 10
                    });
                    instFolder.addInput(vm.data2[player].instruments[instId], 'mute',
                    {
                        label: "mute",
                    });
                };
            }

            // vm.playersConfig.forEach((player) => {
            // // Create a folder for each tab
            //     const playerFolder = vm.pane.addFolder({
            //         title: player.label,
            //         expanded: true,
            //     });
                
            //     let playerName = player.label;
            //     playerFolder.addInput(vm.data, `${playerName}volume`,
            //     {
            //         label: "vol.",
            //         min: 1,
            //         max: 10
            //     });
            //     playerFolder.addInput(vm.data, `${playerName}mute`,
            //     {
            //         label: "mute",
            //     });

            //     console.log("instuments for player " + player.label + " are " + player.instruments)
            //     player.instruments.forEach((instrument) => {
            //         console.log(instrument.name);
            //         // player.instruments.forEach((instrument) => {
            //         const instFolder = playerFolder.addFolder({
            //             title: instrument.name,
            //             // expanded: true,
            //         });
            //         console.log("added sub")
            //         instFolder.addInput(vm.data, `${playerName}${instrument.name}volume`,
            //         {
            //             label: "vol.",
            //             min: 1,
            //             max: 10
            //         });
            //         instFolder.addInput(vm.data, `${playerName}${instrument.name}mute`,
            //         {
            //             label: "mute",
            //         });
            //         // });
            //     });
            // });
        },
        updateData() {
            // Modify the local copy of the propData and emit an event
            this.propData = 'Updated Data';
            this.$emit('update-data', this.propData);
        }
    },
  
  };
  </script>
  <style>
  :root {
    --tp-base-background-color: hsla(0, 9%, 22%, 0.863);
    --tp-base-shadow-color: hsla(44, 78%, 24%, 0.247);
    /* --tp-button-background-color: hsla(0, 0%, 80%, 1); */
    --tp-button-background-color-active: hsla(0, 0%, 100%, 1);
    --tp-button-background-color-focus: hsla(0, 0%, 95%, 1);
    --tp-button-background-color-hover: hsla(0, 0%, 85%, 1);
    --tp-button-foreground-color: hsla(0, 0%, 0%, 0.8);
    /* --tp-container-background-color: hsla(0, 0%, 0%, 0.795); */
    --tp-container-background-color-active: hsla(0, 0%, 0%, 0.781);
    --tp-container-background-color-focus: hsla(0, 0%, 0%, 0.719);
    --tp-container-background-color-hover: hsla(36, 89%, 26%, 0.4); 
    --tp-container-foreground-color: hsla(0, 0%, 100%, 0.5);
    --tp-groove-foreground-color: hsla(0, 78%, 51%, 0.2);
    /* --tp-input-background-color: hsla(0, 81%, 46%, 0.822); */
    --tp-input-background-color-active: hsla(0, 0%, 0%, 0.6);
    --tp-input-background-color-focus: hsla(0, 0%, 0%, 0.5);
    --tp-input-background-color-hover: hsla(45, 72%, 14%, 0.541);
    --tp-input-foreground-color: hsla(41, 92%, 42%, 0.911);
    --tp-label-foreground-color: hsla(39, 53%, 86%, 0.945);
    --tp-mixer-background-color: hsla(0, 0%, 0%, 0.3);
    --tp-mixer-foreground-color: hsla(0, 0%, 100%, 0.3);
  }
  </style>