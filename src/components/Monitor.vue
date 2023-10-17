<!-- <template>
    <div
        :ref="ref_c"
        :id="id_c"
        :style="{
        position: `${position}`,
        top: `${top}px`,
        right: `${right}px`,
        zIndex: 100,
        width: `auto`, 
        height: `auto`,
        // ...styles,
        }"
        @mousedown="startDrag"
    ></div>
</template> -->
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
        height: `auto`,
        // ...styles,
        }"
        @mousedown="startDrag"
    ></div>
</template>
  
<script>
import {Pane} from 'tweakpane';

export default {
    name: 'MonitorComponent',
    props: {
        dataFromParent: {
            type: Object,
            default: () => {}
        },
        ref_c: {
            type: String,
            default: 'monitor'
        },
        id_c: {
            type: String,
            default: 'monitorId'
        },
        position: {
            type: String,
            default: 'absolute'
        },
        top: {
            type: Number,
            default: 311
        },
        right: {
            type: Number,
            default: 20
        },
        width: {
            type: Number,
            default: 300
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
            data: null,
            structure: null,
            title: "",
        };
    },
    beforeCreate(){
        console.log("beforeCreate monitor start")
        console.log("beforeCreate monitor end")
    },
    created() {
        console.log("created monitor start")
        this.$root.$refs.monitor = this;
        console.log(" created monitor end")
    },
    mounted() {
        console.log("mounted monitor start")
    },

    methods: {
        startDrag(event) {
            if (typeof event.target.className !== 'string') return;
            if (
                event.target.classList.contains('sldv') ||
                event.target.id.includes('sldv')
            ) {
                return; // Don't start dragging
            }
            // Calculate the initial click position relative to the element's top-left corner
            this.isDragging = true;
            this.offsetX = this.$refs.monitor.getBoundingClientRect().right - event.clientX;
            this.offsetY = event.clientY - this.$refs.monitor.getBoundingClientRect().top;
            window.addEventListener('mousemove', this.handleDrag);
            window.addEventListener('mouseup', this.stopDrag);
        },
        handleDrag(event) {
            if (this.isDragging) {
                // Update the element's position based on the mouse movement
                // this.$refs.monitor.style.right = event.clientX + this.offsetX + 'px';
                // this.$refs.monitor.style.bottom = event.clientY + this.offsetY + 'px';
                this.$refs.monitor.style.right = window.innerWidth - event.clientX - this.offsetX + 'px';
                this.$refs.monitor.style.top = event.clientY - this.offsetY + 'px';
            }
            
        },
        stopDrag(event) {
            this.isDragging = false;
            window.removeEventListener('mouseup', this.stopDrag);
            window.removeEventListener('mousemove', this.handleDrag);
        },
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
            // vm.pane.on('fold', (ev) => {
            //     console.log('changed: ', ev.value);
            //     ev.stopPropagation();
            //     ev.preventDefault();
            //     ev.cancelBubble = true;
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