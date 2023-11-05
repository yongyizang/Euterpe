<template>
    <div :ref="ref_c" :id="id_c" :style="{
        position: `${position}`,
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 100,
        width: `${width}px`,
        height: `auto`,
        // ...styles,
    }" @mousedown="startDrag"></div>
</template>

<script>
import {Pane} from 'tweakpane';

export default {
    name: 'MixerComponent',
    props: {
        ref_c: {
            type: String,
            default: 'mixer',
        },
        id_c: {
            type: String,
            default: 'mixerId',
        },
        position: {
            type: String,
            default: 'absolute',
        },
        top: {
            type: Number,
            default: 323,
        },
        left: {
            type: Number,
            default: 10,
        },
        width: {
            type: Number,
            default: 200,
        },
        // height: {
        //     type: Number,
        //     default: 400
        // },
        // cssClasses: {
        //   default: '',
        //   type: String
        // },
        // styles: {
        //   type: Object,
        //   default: () => {}
        // },
    },
    data() {
        return {
            pane: null,
            data: {},
            playersConfig: null,
            title: '',
        };
    },
    beforeCreate() {
        console.log('beforeCreate mixer start');
        // this.$root.$refs.mixer = this;
        console.log('beforeCreate mixer end');
    },
    created() {
        console.log('created mixer start');
        this.$root.$refs.mixer = this;
        // this.startAnalyser();
        console.log(' created mixer end');
    },
    mounted() {
        console.log('mounted mixer start');
        this.getMixerData();
    },

    methods: {
        startDrag(event) {
            // If event.target.className is not a string return
            if (typeof event.target.className !== 'string') return;
            // if that string contains 'fldv' or 'rotv'
            if (event.target.className.includes('fldv') ||
                        event.target.className.includes('rotv')
            ) {
                this.isDragging = true;
                this.offsetX = event.clientX - this.$refs.mixer.getBoundingClientRect().left;
                this.offsetY = event.clientY - this.$refs.mixer.getBoundingClientRect().top;
                window.addEventListener('mousemove', this.handleDrag);
                window.addEventListener('mouseup', this.stopDrag);
            }
        },
        handleDrag(event) {
            if (this.isDragging) {
                // Update the element's position based on the mouse movement
                this.$refs.mixer.style.left = event.clientX - this.offsetX + 'px';
                this.$refs.mixer.style.top = event.clientY - this.offsetY + 'px';
            }
        },
        stopDrag(event) {
            this.isDragging = false;
            window.removeEventListener('mouseup', this.stopDrag);
            window.removeEventListener('mousemove', this.handleDrag);
            event.stopPropagation();
            event.preventDefault();
            event.cancelBubble = true;
        },
        loadMixerConfig(playersConfig) {
            const vm = this;
            vm.playersConfig = playersConfig;
            vm.pane = new Pane({
                container: vm.$refs.mixer,
                title: 'Mixer',
            });
            // vm.pane.on('fold', (ev) => {
            //     console.log('changed: ', ev.value);
            //     // ev.stopPropagation();
            //     // ev.preventDefault();
            //     // ev.cancelBubble = true;
            // });
            // vm.pane.on('change', (ev) => {
            //     console.log(ev);
            //     console.log('changed: ' + JSON.stringify(ev.value));
            // });

            // Create the mixer data object for Pane.
            for (const [player, playerData] of Object.entries(vm.playersConfig)) {
                vm.data[`${player}`] = {
                    label: playerData.label,
                    mute: playerData.mute,
                    volume: playerData.volume,
                    instruments: {},
                };
                playerData.instruments.forEach((instrument) => {
                    console.log(instrument.id + ' ' + instrument.label);
                    vm.data[`${player}`].instruments[`${instrument.id}`] = {
                        label: instrument.label,
                        mute: instrument.mute,
                        volume: instrument.volume,
                    };
                });
            };

            // Iterate over the 'players' in the config file
            for (const [player, playerData] of Object.entries(vm.data)) {
                console.log(player, ' ', playerData);
                const playerFolder = vm.pane.addFolder({
                    title: playerData.label,
                    expanded: true,
                });
                playerFolder.addInput(vm.data[player], 'volume',
                    {
                        label: 'vol.',
                        min: 1,
                        max: 10,
                    }).on('change', (ev) => {
                    const changeEvent = {
                        playerId: player,
                        instrumentId: null,
                        what: 'volume',
                        value: ev,
                    };
                    vm.updateData(changeEvent);
                },
                );
                playerFolder.addInput(vm.data[player], 'mute',
                    {
                        label: 'mute',
                    }).on('change', (ev) => {
                    const changeEvent = {
                        playerId: player,
                        instrumentId: null,
                        what: 'mute',
                        value: ev,
                    };
                    vm.updateData(changeEvent);
                },
                );
                for (const [instId, instData] of Object.entries(playerData.instruments)) {
                    console.log(instData.label);
                    // player.instruments.forEach((instrument) => {
                    const instFolder = playerFolder.addFolder({
                        title: instData.label,
                        expanded: false,
                    });
                    console.log('added sub');
                    instFolder.addInput(vm.data[player].instruments[instId], 'volume',
                        {
                            label: 'vol.',
                            min: 1,
                            max: 10,
                        }).on('change', (ev) => {
                        const changeEvent = {
                            playerId: player,
                            instrumentId: instId,
                            what: 'volume',
                            value: ev,
                        };
                        vm.updateData(changeEvent);
                    },
                    );
                    instFolder.addInput(vm.data[player].instruments[instId], 'mute',
                        {
                            label: 'mute',
                        }).on('change', (ev) => {
                        const changeEvent = {
                            playerId: player,
                            instrumentId: instId,
                            what: 'mute',
                            value: ev,
                        };
                        vm.updateData(changeEvent);
                    },
                    );
                };
            }
        },
        // manuallyUpdateData() {
        //     let vm = this;
        //     for (const [player, playerData] of Object.entries(vm.data)) {
        //         let changeEvent = {
        //             playerId: player,
        //             instrumentId: null,
        //             what: 'volume',
        //             value: ev
        //         }
        //         vm.updateData(changeEvent);
        //         for (const [instId, instData] of Object.entries(playerData.instruments)) {
        //             let changeEvent = {
        //                 playerId: player,
        //                 instrumentId: instId,
        //                 what: 'volume',
        //                 value: ev
        //             }
        //             vm.updateData(changeEvent);
        //         };
        //     }
        // },
        updateData(changeEvent) {
            // Emit a signal to push the mixer change
            // to the parent component, which will update
            // the samplers' statuses
            this.$emit('newEventSignal', changeEvent);
        },
        getMixerData() {
            this.$emit('getMixerDataSignal', this.data);
        },
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
