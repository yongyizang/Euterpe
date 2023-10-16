<template>
    <!-- main.vue, the application's main UI file.-->
    <div>
        <div ref="mainLoadingScreen" id="mainLoadingScreen">
            <div id="loadingScreenInjection" class="center">
                <h1 class="loadingTitle">
                {{ config.title }}
                </h1>
                <h3 class="loadingSubtitle"> {{ config.subtitle }}</h3>
                <p ref="workerStatus" class="loadingStatus">
                Loading the Worker...
                </p>
                <div id="entryBtnContainer" style="width:100%;height:60px;">
                    <button @click="entryProgram" ref="entryBtn" class="entryBtn" style="visibility: hidden;">
                        <span style="width:100%;text-align:center;">Play</span>
                    </button>
                </div>
                <p v-if="isNotChrome">
                We highly recommend using Chrome for better user experience.
                </p>
                <p v-if="isMobile">
                The model may not perform normally on mobile devices. We recommend
                using Desktop computers.
                </p>
            </div>
        </div>
        <div ref="mainContent" id="mainContent"  style="justify-content: center; align-items: center;">
            <div style="
                background-color: rgb(0, 0, 0);
                opacity: 0.5;
                display: fixed;
                top: 0;
                right: 0;
                z-index: 999;
                ">
            </div>
            <!-- Intro Modal -->
            <modal v-if="config.introModal" name="introModal" :adaptive="true" @opened="modalCallback" @closed="modalCallback">
                <div class="modalDiv">
                <p class="modalTitle">
                    Introduction
                </p>
                <button class="modalBtn" @click="$modal.hide('introModal')"><md-icon class="modalIcon">close</md-icon></button>
                </div>
                <div class="modalContent">
                <p v-for="(content, index) in config.introModalContent" :key="index">
                    {{ content }}
                    <br />
                </p>
                </div>
            </modal>

            <div v-if="config.gui.pianoRoll.status">
                <PianoRoll id="pianoRoll" style="position:absolute; z-index:0; top:0; left:0;" />
            </div>

            <div v-if="config.gui.keyboard.status">
                <Keyboard id="pianoKeyboard" class="pianoKeyboard" ref="keyboard" :key="keyboardKey"
                :octave-start="keyboardoctaveStart" :octave-end="keyboardoctaveEnd" />
            </div>
            
            <Mixer @newEventSignal="handleMixerUpdate"/>

            <!-- <div v-if="config.gui.monitor.status"> -->
            <Monitor :dataFromParent="dataForMonitoring"/>
            <!-- </div> -->

            <div v-if="config.gui.score.status">
                <Score :scoreShown="scoreShown" :scrollStatus="scrollStatus"/>
            </div>

            <div v-if="audioAndMeter">
                <AudioMeter ref="audioMeter" :width=300 :height="100" :fft_bins="128" orientation="top"
                style="position:absolute; z-index:0; top:0px; left:0px; background-color:transparent" />
            </div>
            
            <!-- <VectorBar ref="vectorBar" :width=300 :height="100" :num_bars="12" orientation="top"
                style="position:absolute; z-index:0; top:0px; right:0px; background-color:transparent" /> -->
            <div v-if="audioAndChroma">
                <ChromaChart  />
            </div>
            <div v-if="textBoxStatus">
                <TextBox :height=100 :width=180 :title="textBoxTitle" :text="textBoxText" 
                    style="position: absolute; bottom: 300px; right: 20px; z-index:8" />
            </div>
            

            <!-- On-screen buttons -->
            <div style="position: absolute; bottom: 230px; right: 11px">
                <md-button class="controlBtn" @click="toggleClock" style="width: 40px">
                <md-icon>{{ localSyncClockStatus ? "pause" : "play_arrow" }}</md-icon>
                </md-button>
                <md-button class="controlBtn" @click="showSettingsModal">
                <md-icon>settings</md-icon>
                </md-button>
                <md-button class="controlBtn" @click="toggleMixer">
                <md-icon>tune</md-icon>
                </md-button>
                <md-button class="controlBtn" @click="toggleMonitor">
                <i class="material-symbols-outlined">monitoring</i>
                </md-button>
            </div>
            <md-button v-if="keyboardoctaveEnd !== 8" @click="transposeOctUp" class="md-icon-button md-raised"
                style="position: absolute; right: 20px; bottom: 100px">
                <md-icon>arrow_forward</md-icon>
            </md-button>
            <md-button v-if="keyboardoctaveStart !== 0" @click="transposeOctDown" class="md-icon-button md-raised"
                style="position: absolute; left: 20px; bottom: 100px">
                <md-icon>arrow_back</md-icon>
            </md-button>


            <!-- Settings Modal -->
            <modal name="settingsModal" :minHeight=600 :adaptive="true" @opened="modalCallback" @closed="modalCallback">
                <!-- overflow-y: scroll; -->
                <div style="padding:0; margin: 0; ">
                <div class="modalDiv">
                    <p class="modalTitle">
                    Settings
                    </p>
                    <button class="modalBtn" @click="$modal.hide('settingsModal')"><md-icon
                        class="modalIcon">close</md-icon></button>
                </div>
                <div class="modalContent" style="overflow-y: scroll; height:600px">
                    <p class="settingsSubtitle">Clock</p>
                    <div class="md-layout md-gutter md-alignment-center">
                    <div class="md-layout-item md-small-size-50 md-xsmall-size-100">
                        <div class="settingsDiv">
                        <p class="settingsOptionTitle">BPM (Max: {{ maxBPM }})</p>
                        <div style="padding-top: 14px">
                            <p class="settingsValue">{{ localBPM }}</p>
                            <vue-slider v-model="localBPM" :lazy="true" :min="60" :max="120" class="settingsSlider"></vue-slider>
                        </div>
                        </div>
                    </div>
                    </div>
                    <p class="settingsSubtitle">MIDI</p>
                    <div class="MIDIInput" v-if="WebMIDISupport">
                        <Dropdown :options="activeDevices" v-on:selected="onMIDIDeviceSelectedChange"
                            placeholder="Type here to search for MIDI device">
                        </Dropdown>
                    </div>
                    <span v-else>
                        Currently, Using MIDI devices in browser is only supported by Google
                        Chrome v43+, Opera v30+ and Microsoft Edge v79+. Please update to
                        one of those browsers if you want to use Web MIDI
                        functionalities.</span>
                    <p class="settingsSubtitle">Worker Parameters</p>
                    <div class="md-layout md-gutter md-alignment-center">
                    <div class="md-layout-item md-large-size-50 md-small-size-100">
                        <div class="md-layout md-gutter md-alignment-center">
                        <!-- Sliders for worker parameters -->
                        <div v-for="sliderItem in sliders" :key="sliderItem.id"
                            class="md-layout-item md-large-size-25 md-alignment-center">
                            <VerticalSlider v-model="sliderItem.value" :min="sliderItem.min" :max=sliderItem.max
                            :label="sliderItem.label" />
                        </div>
                        </div>
                    </div>
                    <div class="md-layout-item md-large-size-50 md-small-size-100">
                        <div class="md-layout md-gutter md-alignment-center">
                        <!-- Buttons for worker parameters -->
                        <div v-for="buttonItem in buttons" :key="buttonItem.id" class="md-layout-item md-large-size-100">
                            <md-button @click="buttonAction(buttonItem.id)" style="width: 100%">
                            <span class="forceTextColor">{{ buttonItem.label }}</span>
                            </md-button>
                        </div>
                        </div>
                    </div>
                    </div>
                    <div class="md-layout md-gutter md-alignment-center">
                    <div class="md-layout-item md-large-size-100">
                        <div class="md-layout md-gutter md-alignment-center">
                        <!-- Switches for worker parameters -->
                        <div v-for="swi in switches" :key="swi.id" class="md-layout-item md-large-size-25 md-medium-size-50">
                            <div style="display:block; min-width:60px; padding-top:17px">
                            <span style="padding:0; margin:0;">{{ swi.label }}</span>
                            <toggle-button color="#74601c" v-model="swi.status" style="transform: scale(0.9);" />
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </modal>
        </div>
    </div>
</template>

<script>
/*
Import custom components
*/
import Keyboard from "@/components/Keyboard.vue";
import PianoRoll from "@/components/PianoRollLegacy.vue";
import Score from "@/components/Score.vue";
import VerticalSlider from '@/components/VerticalSlider.vue'
import HorizontalSlider from '@/components/HorizontalSlider.vue'
import AudioMeter from "@/components/AudioMeter.vue";
// import VectorBar from "../components/VectorBar.vue";
import ChromaChart from "@/components/ChromaChart.vue";
import Monitor from "@/components/Monitor.vue";
import Mixer from "@/components/Mixer.vue";
import TextBox from "@/components/TextBox.vue";

import "../css/main.css";
import * as Tone from "tone";
import { Midi, note } from "@tonaljs/tonal";
import { WebMidi } from "webmidi";
import Dropdown from "vue-simple-search-dropdown";
import AudioKeys from "audiokeys";

import yaml from "js-yaml";
import * as rb from "ringbuf.js";
import {
	playerType, instrumentType, eventSourceType,
  messageType, statusType, noteType,
  uiParameterType,
  workerHookType
} from '@/utils/types.js'

import { URLFromFiles, isMobile, isNotChrome } from '@/utils/helpers.js'
import { NoteEvent } from '@/utils/NoteEvent.js'


export default {

    name: "mainScreen",

    components: {
        Keyboard,
        Score,
        PianoRoll,
        VerticalSlider,
        HorizontalSlider,
        Dropdown,
        AudioMeter,
        TextBox,
        Mixer,
        Monitor,
        ChromaChart
        // VectorBar,

    },

    data() {
        return {
        // Choose the worker. 
        // This string should be one of
        // dir names inside public/workers/
        workerName: "template", 
        // Provide all the config files that should be loaded
        // These should be in public/workers/{workerName}/
        configFiles: ['config.yaml', 'config_widgets.yaml', 'config_players.yaml'], 

        config: null,
                
        playerType,
        instrumentType,
        eventSourceType,
        messageType,
        statusType,
        noteType,
        uiParameterType,
        workerHookType,

                
        // These need to be initialized here as empty arrays (computed properties)
        // They'll be filled in the created() hook
        switches: [],
        sliders: [],
        buttons: [],
        // Information about the players and 
        // instruments available to each player.
        // It's used to create the mixer modal.
        // This is filled in the created() hook
        players: [],

        dataForMonitoring: {},

        // Score status
        scoreShown: false,
        scrollStatus: false,
        scoreStatus: false,
        // Textbox status
        textBoxTitle: null,
        textBoxText: null,
        textBoxStatus: false,

        localBPM: null,
        localSyncClockStatus: false, // used to trigger local UI change
        screenWidth: document.body.clientWidth,
        screenHeight: document.body.clientHeight,
        keyboardKey: 0,
        keyboardoctaveStart: 2,
        keyboardoctaveEnd: 6,

        // audioContext: null,
        mediaStreamSource: null,
        audioSettings: null,
        recorderWorkletNode: null,
        recorderWorkletBundle: null,

        sab: null,
        sab_par_ui: null,
        rb_par_ui: null,
        paramWriter: null,
        sab_par_worker: null,
        rb_par_worker: null,

        monitorObserverInterval: null,

        WebMIDISupport: false,
        pageLoadTime: null,
        modelLoadTime: null,
        activeDevices: [],
        selectedMIDIDevice: "",

        // humanVolume: 1,
        // humanSamplerMuted: false,
        // humanUprightBassVolume: 1,
        // humanUprightBassMuted: false,
        // workerVolume: 1,
        // metronomeVolume: 1,

        // used to calculate the average worker inference time (clockBased mode) 
        // and estimate maxBPM
        modelInferenceTimes: [],
        // maxBPM (or min clock period) supported by the current device
        maxBPM: 0,
        // counter for the number of times the worker inference time exceeds the clock period
        misalignErrCount: 0,

        isNotChrome,
        isMobile,
        // Keep track of all the timeouts ids to clear them when the the user pauses
        timeout_IDS_kill: [],// noteOn related events (keyDown, mouseDown, noteOn, trigerAttack etc)
        timeout_IDS_live: [],

        };
    },

    created() {
        let vm = this;

        console.log("created main start")
        this.loadConfigSync();
        console.log("load config sync done")

        this.$store.commit("setConfig", this.config);
        this.$store.commit("initQuantBuffers", this.config);
        this.$store.commit("setTicksPerMeasure", this.config);
        this.$store.commit("createInstruments", this.config);
        
        // Activate/Deactivate GUI widgets based on config
        this.scoreStatus = this.config.gui.score.status
        this.textBoxStatus = this.config.gui.textBox.status

        // Update the score properties
        this.scoreShown = this.config.gui.score.status; //TODO: unclear use in Score.vue
        // this.scrollEnabled = this.config.gui.score;
        // Set the textBox title
        this.textBoxTitle = this.config.gui.textBox.title;

        // Widgets configurations are stored and can be modified
        // in utils/widgets_config.js
        this.switches = this.config.gui.settingsModal.switches;
        this.sliders = this.config.gui.settingsModal.sliders;
        this.buttons = this.config.gui.settingsModal.buttons;
        this.players = this.config.players;

        this.monitorObserverInterval = 10;
        this.dataForMonitoring = {},
        this.config.gui.monitor.structure.forEach((tab) => {
            tab.parameters.forEach((parameter) => {
                vm.dataForMonitoring[parameter.id] = 0;
            });
        });
        console.log("created localBPM set to defaultBPM from config ", this.config.clockSettings.defaultBPM);
        this.localBPM = this.config.clockSettings.defaultBPM;
        console.log(this.dataForMonitoring);
        console.log("created main end")
    },

    beforeMount() {
        console.log("beforeMount main start");
        // let vm = this;
        console.log("beforeMount main end");
    },

    async mounted() {
        console.log("main mounted");
        var vm = this;

        vm.$root.$refs.monitor.loadMonitorConfig(vm.config.gui.monitor);
        vm.$root.$refs.mixer.loadMixerConfig(vm.config.players);

        /*
        * Loading Animation: set initial status of both div
        */
        vm.$refs.mainContent.style.display = "none";
        vm.$refs.entryBtn.style.visibility = "hidden";

        vm.audioContext = new AudioContext();
        // Tone.setContext(vm.audioContext); // this cause huge latency
        Tone.context.lookAhead = 0; // increase it if you experience audio clicks

        // SAB
        // get a memory region for the Audio ring buffer
        // length in time is 1 second of stereo audio
        // Float32Array is 4 bytes per sample
        vm.sab = rb.RingBuffer.getStorageForCapacity(vm.audioContext.sampleRate * 2, Float32Array);
        

        // get a memory region for the parameter ring buffer
        // This one is to send parameters from the UI to the worker
        vm.sab_par_ui = rb.RingBuffer.getStorageForCapacity(31, Uint8Array);
        vm.rb_par_ui = new rb.RingBuffer(vm.sab_par_ui, Uint8Array);
        vm.paramWriter = new rb.ParameterWriter(vm.rb_par_ui);

        // get a memory region for the parameter ring buffer
        // This one is to send parameters from the worker to the UI
        vm.sab_par_worker = rb.RingBuffer.getStorageForCapacity(31, Uint8Array);
        vm.rb_par_worker = new rb.RingBuffer(vm.sab_par_worker, Uint8Array);
        vm.paramReader = new rb.ParameterReader(vm.rb_par_worker);


        // Initialize agent worker
        // experiment with , { type : 'module' }
        vm.worker = new Worker(`/workers/${vm.workerName}/worker.js`);
        vm.worker.onmessage = vm.workerCallback;

        // Send a message to worker with some necessary 
        // configurations and constants to store inside the worker
        // TODO : i removed await
        vm.worker.postMessage({
            hookType: vm.workerHookType.INIT_WORKER,
            content: {
                config: vm.config,
                playerType: vm.playerType,
                instrumentType: vm.instrumentType,
                messageType: vm.messageType,
                statusType: vm.statusType,
                noteType: vm.noteType,
                uiParameterType: vm.uiParameterType,
                workerHookType: vm.workerHookType,

                sab: vm.sab,
                sab_par_ui: vm.sab_par_ui,
                sab_par_worker: vm.sab_par_worker,
                channelCount: 2,
                sampleRate: vm.audioContext.sampleRate
            }
        });
        vm.timeout_IDS_live.push(setInterval(vm.workerParameterObserver, vm.monitorObserverInterval));
        

        // Initialize Clock Worker (module)
        vm.clockWorker = new Worker("/workers/clock.js", { type: "module" });
        vm.clockWorker.onmessage = vm.tickBehavior;
        vm.clockWorker.postMessage({ action: 'setBpm', bpm: vm.localBPM });
        vm.$store.commit("initializeClock");

        if (vm.config.interactionMode.audioMode){
            /*
            * Initialize Audio Recorder (for audio recording).
            */
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false,
            });

            vm.mediaStreamSource = vm.audioContext.createMediaStreamSource(
                stream
            );


            vm.analyserNode = vm.audioContext.createAnalyser();

            vm.mediaStreamSource.connect(vm.analyserNode);

            if (vm.config.gui.audioMeter.status){
                vm.$root.$refs.audioMeter.init(vm.analyserNode);
                vm.$root.$refs.audioMeter.updateAnalysis();
            }
        
            // vm.$root.$refs.vectorBar.init();
            // vm.$root.$refs.vectorBar.updateAnalysis();

            const recorderWorkletUrl = await URLFromFiles(['recorder-worklet.js', 'libraries/index_rb.js'])
            await vm.audioContext.audioWorklet.addModule(recorderWorkletUrl);
        
        

            vm.recorderWorkletNode = new AudioWorkletNode(
                vm.audioContext,
                "recorder-worklet",
                { processorOptions: vm.sab }
            );

            vm.recorderWorkletNode.port.postMessage("ping")

            vm.recorderWorkletNode.port.addEventListener("message", (event) => {
                console.log("Received from Worklet" + event.data);
            });
            // vm.recorderWorkletNode.port.start(); # TODO do I need this for ping/pong ?
            // send the mic to the recorderNode --> recorderWorklet
            vm.mediaStreamSource.connect(vm.recorderWorkletNode);
            // vm.workerPlayer = new Tone.Player().toDestination();
        }
        vm.audioContext.resume(); // ?
        /*
        * Web MIDI logic
        */
        if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess().then(function (access) {
            vm.WebMIDISupport = true;
            access.onstatechange = vm.onEnabled;
        });
        // Enable WebMIDI, then call onEnabled method.
        WebMidi.enable()
            .then(vm.onEnabled)
            .catch((err) => this.$toasted.show("WebMIDI Error: " + err));
        }

        /*
        * Initialize computer keyboard logic
        * AudioKeys maps the computer keyboard to midi values
        */
        var keyboard = new AudioKeys({
            // set polyphony it to a very high number. 
            // we will handle the polyphony ourselves.
            polyphony: 100,
            rows: 2,
            priority: "last",
            rootNote: 60,
        });

        // callback for when a laptop keyboard key is pressed
        keyboard.down(function (note) {
            let noteName = Midi.midiToNoteName(note.note, { sharps: true });
            const newNoteEvent = new NoteEvent();
            newNoteEvent.player = vm.playerType.HUMAN;
            newNoteEvent.instrument = vm.instrumentType.PIANO;
            newNoteEvent.source = vm.eventSourceType.KEYBOARD;
            newNoteEvent.name = noteName;
            newNoteEvent.type = vm.noteType.NOTE_ON;
            newNoteEvent.channel = 140; // this is channel midi channel 0
            newNoteEvent.midi = note.note;
            newNoteEvent.velocity = 127;
            newNoteEvent.createdAt = {
                seconds: performance.now(),
                tick: vm.$store.getters.getGlobalTickDelayed,
            };
            newNoteEvent.playAfter = {
                seconds: 0,
                tick: 0
            };
            newNoteEvent.duration = null;
            vm.processUserNoteEvent(newNoteEvent);
        });

        // callback for when a laptop keyboard key is released
        keyboard.up(function (note) {
            let noteName = Midi.midiToNoteName(note.note, { sharps: true });
            const newNoteEvent = new NoteEvent();
            newNoteEvent.player = vm.playerType.HUMAN;
            newNoteEvent.instrument = vm.instrumentType.PIANO;
            newNoteEvent.source = vm.eventSourceType.KEYBOARD;
            newNoteEvent.name = noteName;
            newNoteEvent.type = vm.noteType.NOTE_OFF;
            newNoteEvent.channel = 140; // this is channel midi channel 0
            newNoteEvent.midi = note.note;
            newNoteEvent.velocity = 127;
            newNoteEvent.createdAt = {
                seconds: performance.now(),
                tick: vm.$store.getters.getGlobalTickDelayed,
            };
            newNoteEvent.playAfter = {
                seconds: 0,
                tick: 0
            };
            newNoteEvent.duration = null;

            vm.processUserNoteEvent(newNoteEvent)
        });

        /*
        * Minor
        */
        window.onresize = () => {
            return (() => {
                window.screenWidth = document.body.clientWidth;
                vm.screenWidth = window.screenWidth;
            })();
        };
        // Prevent spacebar trigger any button
        document.querySelectorAll("button").forEach(function (item) {
            item.addEventListener("focus", function () {
                this.blur();
            });
        });

        // spacebar trigger play btn
        document.addEventListener("keypress", function (event) {
            if (event.code == "Space" && !vm.$store.getters.getModalStatus) {
                // spacebar could toggle clock
                vm.toggleClock();
            }
        });

        vm.modelLoadTime = Date.now();

    },
    methods: {

        // Clock behavior function.
        async tickBehavior() {
            var vm = this;
            if (vm.$store.getters.getClockStatus) {
                vm.$store.commit("incrementTick");
                
                // Trigger the metronome only if there is a "metronome" entry in config_players.yaml
                if (vm.config.players.metronome)
                    vm.metronomeTrigger(); 

                // in grid-based mode, the worker's sampler is triggered in sync with the clock
                vm.triggerWorkerSamplerSync(); // UNCOMMENT


                // run the worker with a small delay of tick/4 in order to include 
                // any notes that the user played very close to the tick change.
                // this makes the grid a bit more flexible, and the human input is correctly parsed
                // In terms of playability, the human finds it much more easy to play along the metronome on the grid
                // TUTOR: have a flag for that in config named delayedExecution
                if (vm.config.noteModeSettings.gridBased.status) {
                    if (vm.config.noteModeSettings.gridBased.delayedExecution) {
                        console.log("delayedExecution");
                        vm.timeout_IDS_live.push(setTimeout(function () {
                                vm.runTheWorker();
                            }, parseInt(vm.$store.getters.getClockPeriod / 4))
                        );
                    }  else {
                        vm.runTheWorker();
                    }                  
                } else {
                    // inside runTheWorker we increment the "delayed" tick number.
                    // If we don't run the worker, we still want to increment the "delayed" tick number
                    // because other parts of the code depend on it. In this case tick === delayedTick
                    vm.$store.commit("incrementTickDelayed");
                }
            }
        },

        async toggleClock() {
            var vm = this;
            if (!vm.localSyncClockStatus) {
                vm.startRecording();
                vm.clockWorker.postMessage({ action: 'startClock' });
            } else {
                vm.stopRecording();
                vm.clockWorker.postMessage({ action: 'stopClock' });
            }
            vm.localSyncClockStatus = !vm.localSyncClockStatus;
            // Allowing tickNumber to add to itself.
            vm.$store.commit("changeClockStatus");
            // clear pianoState
            vm.$store.commit("clearPianoState");

            // If the clock is not yet initialized...
            // if (!vm.$store.getters.getClockInitialized) {
            //     // Then set it to intialized
            //     vm.$store.commit("initializeClock");
            //     // And intialized it.
            //     // An infinite recursion that implements the clock. 

            //     // 1st Option - using setTimeout -- variable clock speed
            //     // function sendOutTicks() {
            //     //   tickBehavior();
            //     //   vm.timeout_IDS_live.push(setTimeout(sendOutTicks, vm.$store.getters.getClockPeriod));
            //     // }
            //     // sendOutTicks();

            //     // 2nd OPTION - using setInterval -- constant clock speed
            //     // setInterval(tickBehavior, vm.$store.getters.getClockPeriod);

            //     // 3rd OPTION - using requestAnimationFrame -- variable clock speed
            //     //   let lastTime = 0;
            //     //   function sendOutTicks(timestamp) {
            //     //     let interval = vm.$store.getters.getClockPeriod;
            //     //     if (timestamp - lastTime >= interval) {
            //     //       tickBehavior();
            //     //       lastTime = timestamp;
            //     //     }

            //     //     requestAnimationFrame(sendOutTicks);
            //     //   }
            //     //   sendOutTicks();
            //     /*
            //     4th OPTION - webWorker and setTimeout -- variable clock speed
            //     */
            //     // TUTOR this should be initialized in mounted. Here we should just toggle the begining of setInterval
            //     // TOTOR also add a stopClock method
            //     // const blob = new Blob([
            //     //     /* javascript */`
            //     //     // the initial timeout time
            //     //     let bpm = ${vm.$store.getters.getBPM};
            //     //     let timeoutTime =  1000*60/bpm/4;//vm.$store.getters.getClockPeriod;
            //     //     let aa = 0;
            //     //     // onmessage callback
            //     //     self.onmessage = function(msg){
            //     //     timeoutTime = parseInt(msg.data);
            //     //     };
            //     //     // the tick function which posts a message
            //     //     // and schedules a new tick
            //     //     function tick(){
                    
            //     //     self.postMessage('tick');
            //     //     per = performance.now() - aa;
            //     //     // console.log("ClockWorker ",  Math.round(this.per), " bpm ", Math.round(60000/this.per/4));
            //     //     aa = performance.now()
            //     //     //   setTimeout(tick, timeoutTime);
            //     //     }
            //     //     // call tick initially
            //     //     aa = performance.now()
            //     //     // tick();
            //     //     setInterval(tick, timeoutTime);
            //     //     `
            //     // ], { type: "text/javascript" });
            //     // const blobUrl = URL.createObjectURL(blob);
            //     // const worker = new Worker(blobUrl);
            //     // // worker.onmessage = vm.runTheWorker;//.bind(this);
            //     // vm.clockWorker = worker;
            //     // worker.onmessage = vm.tickBehavior;//.bind(this);
            // }
        },

        metronomeTrigger() {
            var vm = this;
            // This method would trigger the metronome sampler.
            // getTicksPerBeat returns the number of ticks per beat
            // and we want the metronome to trigger every beat
            if (this.$store.getters.getLocalTick % this.$store.getters.getTicksPerBeat == 0) {
            var currentNote =
                this.$store.getters.getLocalTick % this.$store.getters.getTicksPerMeasure === 0 ? "G0" : "C0";
                    const metronomeNote = new NoteEvent()
                    metronomeNote.player = vm.playerType.METRONOME;
                    metronomeNote.name = currentNote;
                    metronomeNote.type = vm.noteType.NOTE_ON;
                    metronomeNote.velocity = 127;
                    metronomeNote.playAfter = {
                        tick: 0,
                        seconds: 0
                    }
            this.$store.dispatch("samplerOn", metronomeNote);
            this.calculateMaxBPM();
            }
        },

        processUserNoteEvent(noteEvent, onScreenKeyboard = false) {
            // return 0;
            var vm = this;
            // We always send the user's input directly to the sampler
            // for immediate playback
            let whiteKey = noteEvent.name.includes('#') ? false : true;
            // Check if the current on-screen key is within the current screen view
            // if (this.$root.$refs.keyboard.$refs[noteEvent.name] ) is null then the key is not on screen
            let keyOnScreenRange = this.$root.$refs.keyboard.$refs[noteEvent.name] ? true : false;
            if (noteEvent.type == vm.noteType.NOTE_ON) {
                    // console.log("note on");
                if (this.config.gui.pianoRoll.status) {
                    vm.$root.$refs.pianoRoll.keyDown(noteEvent);
                }
                vm.$store.dispatch("samplerOn", noteEvent);
                if (keyOnScreenRange && !onScreenKeyboard) {
                    if (whiteKey){
                        this.$root.$refs.keyboard.$refs[noteEvent.name][0].classList.add('active-white-key-human')
                    } else {
                        this.$root.$refs.keyboard.$refs[noteEvent.name][0].classList.add('active-black-key-human')
                    }
                }
            } else if (noteEvent.type == vm.noteType.NOTE_OFF) {
                if (this.config.gui.pianoRoll.status) {
                    vm.$root.$refs.pianoRoll.keyUp(noteEvent);
                }
                vm.$store.dispatch("samplerOff", noteEvent);
                if (keyOnScreenRange && !onScreenKeyboard) {
                    if (whiteKey){
                        this.$root.$refs.keyboard.$refs[noteEvent.name][0].classList.remove('active-white-key-human')
                    } else {
                        this.$root.$refs.keyboard.$refs[noteEvent.name][0].classList.remove('active-black-key-human')
                    }
                }
            }

            // If the clock is running, send the note to the piano roll
            if (vm.$store.getters.getClockStatus) {
              // If eventBased mode, send an NOTE_EVENT MICP packet to the worker
              // this packet will be sent to the processUserNoteEvent hook.
              if (vm.config.noteModeSettings.eventBased) {
                vm.worker.postMessage({
                  hookType: vm.workerHookType.NOTE_EVENT,
                  content: noteEvent,
                });
              }
			}
		},
        
        /*
        * neural network web worker's callback and worker call methods.
        * Called every tick, and processes the AI's output.
        */
        // TODO : change the name : agent, clock event, tick etc
        runTheWorker() {
            const vm = this;
            // For both GRID and CONTINUOUS modes, we also quantize the user input to the clock grid
            // it's up to the worker to use it if it wants to.
            this.estimateHumanQuantizedNote();

            // remember, runTheWorker happens with a small delay of tick/4 after the tick
            // here I just keep track of the 'delayed' tick
            this.$store.commit("incrementTickDelayed");

            // MAJOR TODO : draw should probably go before the delayedTickIncrement
            // if (vm.config.gui.score.status) {
            //     this.$root.$refs.score.draw();
            // }
            let messageContent = {
                tick: this.$store.getters.getLocalTick,
                globalTick: this.$store.getters.getGlobalTick,
            }
            if (vm.config.noteModeSettings.gridBased.eventBuffer)
                messageContent['humanContinuousBuffer'] = this.$store.getters.getMidiEventBuffer;
            if (vm.config.noteModeSettings.gridBased.quantizedEvents)
                messageContent['humanQuantizedInput'] = this.$store.getters.getHumanInputFor(this.$store.getters.getLocalTick);
            this.worker.postMessage({
                hookType: vm.workerHookType.CLOCK_EVENT,
                content: messageContent,
            })
        },

        estimateHumanQuantizedNote() {
            var vm = this;
            /* 
            1) Get the raw continuous buffers for the current tick (bufferOn, bufferOff, bufferEvent)
            2) preprocess them before quantization
                a) In bufferEvent, we can remove the notes whose duration is less than the tick duration 
            */

            const bufferEvent = this.$store.getters.getMidiEventBuffer;
            // activePianoNotes are sorted by their "on" timestamp (newest to oldest)
            const activePianoNotes = this.$store.getters.getActivePianoNotes;
            let currentQuantizedEvents = [];

            // 2) preprocess them before quantization
            //     a) In bufferEvent, we can remove the notes whose duration is less than the tick duration 
            // TODO : move this to utilities or smth
            let indexesToRemove = []; // the indexes of the events to be removed
            for (let i = bufferEvent.length - 1; i >= 0; i--) {
                let elem = bufferEvent[i];
                if (elem.type === vm.noteType.NOTE_OFF) {
                const matchingIndexes = bufferEvent
                    .map((e, i) => (e.type === vm.noteType.NOTE_ON && e.midi === elem.midi && e.createdAt.seconds < elem.createdAt.seconds) ? i : -1)
                    .filter(index => index !== -1);
                if (matchingIndexes.length > 0) {
                    indexesToRemove.push(i);
                    indexesToRemove.push(Math.max(...matchingIndexes));
                }
                }
            }
            indexesToRemove = Array.from(new Set([...indexesToRemove]));
            const cleanedEventBuffer = bufferEvent.filter((el, index) => !indexesToRemove.includes(index));
            // console.log(`bufferEvent ${bufferEvent.length} cleanedEventBuffer ${cleanedEventBuffer.length} activePianoNotes ${activePianoNotes.length}`);
            // iterate over the active notes. If the note exists in the bufferEvent as an "on" event, then we have a note on
            // if the note does not exist in the bufferEvent, then we have a continuation of the note (we assume it was activated in a previous tick)
            for (let i = 0; i < activePianoNotes.length; i++) {
                const midi = activePianoNotes[i].midi;
                const noteOnEvent = cleanedEventBuffer.find(elem => elem.type === vm.noteType.NOTE_ON && elem.midi === midi);
                if (noteOnEvent) {
                // currentQuantizedEvents.push({
                //   type: "on",
                //   midi: midi,
                // })
                currentQuantizedEvents.push(noteOnEvent)
                }
                else {
                            const noteHoldEvent = new NoteEvent();
                            noteHoldEvent.type = vm.noteType.NOTE_HOLD;
                            noteHoldEvent.player = vm.playerType.HUMAN;
                            noteHoldEvent.midi = midi;

                currentQuantizedEvents.push(noteHoldEvent);
                }
            }
            // TODO : it seems I ignore rests. If no active notes, then currentQuantizedEvents will be empty

            // now iterate over the bufferEvent and find all the noteOff notes and push them to currentQuantizedEvents as off events
            // for (let i = 0; i < cleanedEventBuffer.length; i++) {
            //   const elem = cleanedEventBuffer[i];
            //   if (elem.type === "noteOff") {
            //     currentQuantizedEvents.push({
            //       type: "off",
            //       midi: elem.midi,
            //     })
            //   }
            // }

            // Due to the order we were pushing the events, the first elements of currentQuantizedEvents are the "on", 
            // then the "hold" and finally the "off". Also because activeNotes are already sorted by their "noteOn" timestamp
            // the events in currentQuantizedEvents are also sorted by their original "noteOn" timestamp

            // Now if we want we can constraint the polyphony. If polyphony = 3, then we can only have 3 notes on at the same time
            // the way to do that is to keep at most the first 3 "on" or "hold" events in currentQuantizedEvents and remove the rest "on" and "hold"

            // TODO : FOR NOW WE DON"T INCLUDE NOTE_OFF EVENTS IN THE QUANTIZED DATA.
            let constrainedCurrentQuantizedEvents = [];
            let onHoldEvents = currentQuantizedEvents.filter(elem => elem.type === vm.noteType.NOTE_ON || elem.type === vm.noteType.NOTE_HOLD);
            // let offEvents = currentQuantizedEvents.filter(elem => elem.type === "off");
            if (onHoldEvents.length > vm.config.noteModeSettings.gridBased.polyphony.input) {
                // let onHoldEventsToRemove = onHoldEvents.slice(polyphony);
                let onHoldEventsToKeep = onHoldEvents.slice(0, vm.config.polyphony.input);
                // let offEventsToAdd = onHoldEventsToRemove.map(elem => {
                //   return {
                //     type: "off",
                //     midi: elem.midi,
                //   }
                // })
                constrainedCurrentQuantizedEvents = [...onHoldEventsToKeep];//, ...offEventsToAdd, ...offEvents];
            }
            else {
                constrainedCurrentQuantizedEvents = [...currentQuantizedEvents];
            }

            this.$store.dispatch("storeHumanQuantizedInput", constrainedCurrentQuantizedEvents);

            this.$store.commit("clearContinuousBuffers");
            // TODO : for the future, keep a reference to the active notes of the previous tick
            // TODO : for more accuracy keep also a reference to the previous tick's quantized notes and constrained quantized notes
            // TODO : and modify the logic accordingly.
            },

        workerParameterObserver() {
            let newParameterWorker = { index: null, value: null };
            if (this.paramReader.dequeue_change(newParameterWorker)) {
                this.dataForMonitoring[newParameterWorker.index] = newParameterWorker.value;
                if (newParameterWorker.index == 4) {
                }
            }
        },

        triggerWorkerSamplerSync() {
            var vm = this;
            const workerNotesToBePlayed = this.$store.getters.popWorkerNotesToBePlayedAt(
                this.$store.getters.getGlobalTickDelayed
            );
            if (workerNotesToBePlayed.length > 0) {
                workerNotesToBePlayed.forEach((noteEvent) => {
                vm.processWorkerNoteEvent(noteEvent);
                });
            }
        },

        async workerCallback(e) {
            const vm = this;
            let hookType = parseInt(e.data.hookType);
            let message = e.data.message;
            if (hookType == vm.workerHookType.CLOCK_EVENT) {
                // Look for the CLOCK_TIME message
                // The worker should always include a message of type CLOCK_TIME
                // when posting from the CLOCK_EVENT hook
                let workerPredictionTick = e.data.message[vm.messageType.CLOCK_TIME];
                if ((workerPredictionTick !== this.$store.getters.getLocalTickDelayed) && (this.$store.getters.getGlobalTick > 2)) {
                this.$toasted.show(
                    "Network tick misalignment: expecting " +
                    this.$store.getters.getLocalTickDelayed +
                    ", got " +
                    workerPredictionTick
                );
                this.misalignErrCount += 1;
                }
            }

            for (let messageTypeStr in message) {
                let messageValue = message[messageTypeStr];
                let messageType = parseInt(messageTypeStr);

                switch (messageType) {
                    case vm.messageType.STATUS:
                        if (messageValue == vm.statusType.SUCCESS) {
                            vm.$refs.entryBtn.classList.add("fade-in");
                            vm.$refs.entryBtn.style.visibility = "visible";
                            vm.modelLoadTime = Date.now() - vm.modelLoadTime;
                            console.log("success");
                        }
                        break;
                    case vm.messageType.NOTE_LIST: {
                        const noteEventsList = messageValue;
                        noteEventsList.forEach((noteEventPlain) => {
                            // The noteEvents received from the worker are serialized
                            // we need to deserialize them before using them
                            let noteEvent = NoteEvent.fromPlain(noteEventPlain);
                            if (noteEvent.playAfter.tick > 0) {
                                this.$store.dispatch("storeWorkerQuantizedOutput", noteEvent);
                            } else {
                                vm.processWorkerNoteEvent(noteEvent);
                            }
                        });
                        break;
                    }
                    case vm.messageType.CHROMA_VECTOR:
                        if (this.audioAndChroma)
                            this.$root.$refs.chromaChart.updateChromaData(messageValue);
                            // this.$root.$refs.vectorBar.updateVectorData(messageValue);
                        else
                            console.warn("The Agent generates chroma vectors but the Chroma Chart is not enabled in the config file");
                        break;
                    case vm.messageType.LABEL:
                        this.textBoxText = messageValue;
                        break;
                    case vm.messageType.TEXT:
                        if (hookType == vm.workerHookType.INIT_WORKER) {
                            const workerStatus = vm.$refs.workerStatus;
                            workerStatus.innerHTML = messageValue;
                        }
                        else {
                            this.textBoxText = messageValue;
                        }
                        break;
                    case vm.messageType.CLOCK_TIME:
                        break;
                    default:
                        console.log("Unknown message type: ", messageType);
                        break;
                }
            }
        },

        uiNoteOnWorker(noteEvent) {
            let vm = this;
            // set a timeout to call keyDown based on noteEvent.timestamp.seconds
            // TODO : the worker should do that
            let noteName = Midi.midiToNoteName(noteEvent.midi, { sharps: true });
            let whiteKey = noteName.includes('#') ? false : true;
            // Check if the current on-screen key is within the current screen view
            // if (this.$root.$refs.keyboard.$refs[noteEvent.name] ) is null then the key is not on screen
            let keyOnScreenRange = this.$root.$refs.keyboard.$refs[noteName] ? true : false;
            vm.timeout_IDS_kill.push(setTimeout(() => {
                if (this.config.gui.pianoRoll.status)
                    this.$root.$refs.pianoRoll.keyDown(noteEvent);
                if (keyOnScreenRange){
                    if (whiteKey){
                        this.$root.$refs.keyboard.$refs[noteName][0].classList.add('active-white-key-worker');
                    } else {
                        this.$root.$refs.keyboard.$refs[noteName][0].classList.add('active-black-key-worker');
                    }
                }
            }, noteEvent.playAfter.seconds * 1000)
            );
        },

        // TODO : refactor this one. choose which option
        // to use and remove the other one
        processWorkerNoteEvent(noteEvent) {
            let vm = this;
            // The noteEvents that arrive here, have already waited for playAfter.tick ticks (if any)
            // so we can only care about playAfter.seconds here. 
            if (noteEvent.type === vm.noteType.NOTE_ON) {

                // Here we check if this note has a defined duration. 
                if (noteEvent.duration != null) {
                    // Two ways to dealwith notes that have predefined duration.
                    // 1) Create a matching NOTE_OFF event and schedule it to be played after 'duration'
                    // 2) Use Tone.js triggerAttackRelease() api, which takes care of the NOTE_OFF event
                    
                    if (noteEvent.duration.tick > 0) {
                        // ---------------- Second OPTION ----------------
                        if (vm.config.custom.useTriggerRelease) {
                            this.$store.dispatch("samplerOnOff", noteEvent);
                            // console.log("option2  ")
                        } else {
                            this.$store.dispatch("samplerOn", noteEvent);
                            // console.log("option1 ")
                        }
                        // else {
                        // If its duration is specified in ticks, then 
                        // create a noteEvent with the same properties but type NOTE_OFF
                        // and modify its playAfter accordingly. Also set its duration to null
                        // so that it doesn't get processed again in this if statement
                        let noteEventOff = NoteEvent.copy(noteEvent);
                        noteEventOff.type = vm.noteType.NOTE_OFF;
                        noteEventOff.playAfter.tick = noteEvent.duration.tick;
                        noteEventOff.playAfter.seconds += noteEvent.duration.seconds;
                        noteEventOff.duration = null;
                        // An ugly hack to make the two options work together for now.
                        // Once we decide which option to use, we can remove this.
                        if (vm.config.custom.useTriggerRelease){
                            noteEventOff.custom = true;
                        }
                        this.$store.dispatch("storeWorkerQuantizedOutput", noteEventOff);
                        // }
                    
                    } else if (noteEvent.duration.tick == 0){
                        if (noteEvent.duration.seconds > 0){
                            if (vm.config.custom.useTriggerRelease) {
                                // console.log("about to send samplerOnOff ", noteEvent.midi);
                                this.$store.dispatch("samplerOnOff", noteEvent);
                                vm.timeout_IDS_live.push(setTimeout(() => {
                                    this.uiNoteOffWorker(noteEvent);
                                }, noteEvent.duration.seconds * 1000)
                                );
                            
                            // console.log("option2  ")
                            } else {
                                this.$store.dispatch("samplerOn", noteEvent);
                                console.log("option1 ")
                                // if I want option1 when duration is 0ticks and >0seconds
                                // I need to create a new noteOff event, and send it after >0seconds
                                // to a new method  that will call samplerOff and uiNoteOffWorker. TODO
                                // For now, I just use option2
                                vm.timeout_IDS_live.push(setTimeout(() => {
                                        this.uiNoteOffWorker(noteEvent);
                                        this.$store.dispatch("samplerOff", noteEvent)
                                    }, noteEvent.duration.seconds * 1000)
                                );
                            }
                        } else {
                            // throw error, worker generated note with duration 0ticks and 0seconds
                            console.error("Worker generated note with duration 0 ticks and 0 seconds")
                        }
                    }

                } 
                else {
                    this.$store.dispatch("samplerOn", noteEvent);
                }
                // this.$store.dispatch("samplerOn", noteEvent);
                this.uiNoteOnWorker(noteEvent);
            } else if (noteEvent.type === vm.noteType.NOTE_OFF) {
                if (!noteEvent.hasOwnProperty('custom')){
                    this.$store.dispatch("samplerOff", noteEvent);
                }
                // console.log("about to call uiNoteOffWorker");
                this.uiNoteOffWorker(noteEvent);
            }
        },

        uiNoteOffWorker(noteEvent){
            let vm = this;
            // console.log("uiNoteOffWorker")
            // TODO : the worker should do that
            let noteName = Midi.midiToNoteName(noteEvent.midi, { sharps: true });
            // If '#' in noteName then whiteKey is false else true
            let whiteKey = noteName.includes('#') ? false : true;
            // Check if the current on-screen key is within the current screen view
            // if (this.$root.$refs.keyboard.$refs[noteEvent.name] ) is null then the key is not on screen
            let keyOnScreenRange = this.$root.$refs.keyboard.$refs[noteName] ? true : false;
            // set a timeout to call keyUp based on noteEvent.playAfter.seconds
            vm.timeout_IDS_live.push(setTimeout(() => {
                if (keyOnScreenRange){
                    if (whiteKey){
                        // console.log("released white key ", noteName)
                    this.$root.$refs.keyboard.$refs[noteName][0].classList.remove('active-white-key-worker');
                    } else {
                        // console.log("released black key ", noteName)
                    this.$root.$refs.keyboard.$refs[noteName][0].classList.remove('active-black-key-worker');
                    }
                }
                if (this.config.gui.pianoRoll.status)
                    this.$root.$refs.pianoRoll.keyUp(noteEvent);
            }, noteEvent.playAfter.seconds * 1000)
            );
        },

        /*
        * Web MIDI
        */
        onEnabled() {
            const vm = this;
            if (WebMidi.inputs.length < 1) {
                vm.activeDevices = [];
            } else {
                WebMidi.inputs.forEach((device) => {
                vm.activeDevices.push({ id: device.id, name: device.name });
                });
                this.selectedMIDIDevice = this.activeDevices[0].id;
                this.messageListener();
            }
        },

        onMIDIDeviceSelectedChange(state) {
            const vm = this;
            if (state.id) {
                if (vm.selectedMIDIDevice !== state.id) {
                vm.selectedMIDIDevice = state.id;
                vm.messageListener();
                }
            }
        },

        // listens for midi messages from a midi keyboard
        messageListener() {
            const vm = this;
            const inputDevice = WebMidi.getInputById(this.selectedMIDIDevice);
            inputDevice.addListener("noteon", (message) => {
                const newNoteEvent = new NoteEvent();
                newNoteEvent.player = vm.playerType.HUMAN;
                newNoteEvent.instrument = vm.instrumentType.PIANO;
                newNoteEvent.name = message.note.identifier;
                newNoteEvent.source = vm.eventSourceType.MIDI_KEYBOARD;
                newNoteEvent.type = vm.noteType.NOTE_ON;
                newNoteEvent.channel = message.data[0];
                newNoteEvent.midi = message.data[1];
                newNoteEvent.velocity = message.data[2];
                newNoteEvent.createdAt = {
                    seconds: performance.now(), // message.timestamp
                    tick: vm.$store.getters.getGlobalTickDelayed,
                };
                newNoteEvent.playAfter = {
                    seconds: 0,
                    tick: 0
                };
                newNoteEvent.duration = null;

                vm.processUserNoteEvent(newNoteEvent)
            });

            inputDevice.addListener("noteoff", (message) => {
                const newNoteEvent = new NoteEvent();
                newNoteEvent.player = vm.playerType.HUMAN;
                newNoteEvent.instrument = vm.instrumentType.PIANO;
                newNoteEvent.name = message.note.identifier;
                newNoteEvent.source = vm.eventSourceType.MIDI_KEYBOARD;
                newNoteEvent.type = vm.noteType.NOTE_OFF;
                newNoteEvent.channel = message.data[0];
                newNoteEvent.midi = message.data[1];
                newNoteEvent.velocity = message.data[2];
                newNoteEvent.createdAt = {
                    seconds: performance.now(), // message.timestamp
                    tick: vm.$store.getters.getGlobalTickDelayed,
                };
                newNoteEvent.playAfter = {
                    seconds: 0,
                    tick: 0
                };
                newNoteEvent.duration = null;
                
                vm.processUserNoteEvent(newNoteEvent)
            });
        },

        startRecording() {
            // this.recorderWorkletNode.parameters.get('recordingStatus').setValueAtTime(1, this.audioContext.currentTime);
            this.$store.commit("startUnMute");
        },

        stopRecording() {
            // this.recorderWorkletNode.parameters.get('recordingStatus').setValueAtTime(0, this.audioContext.currentTime);
            this.$store.commit("stopMute");
            // this is a nice hack
            let id = setTimeout(function() {}, 0);
            while (id--) {
                // check if id is in timeout_IDS_live. if not, then clear it
                if (this.timeout_IDS_kill.includes(id)){
                // console.log("deleting timeout id " + id);
                clearTimeout(id); // will do nothing if no timeout with id is present
                }
            }
            // this.timeout_IDS_kill.forEach((timeoutId) => {
            //   clearTimeout(timeoutId);
            // });
        },

        /*
        * Loading animation, switch between main content and loading welcome page.
        */
        entryProgram() {
            const vm = this;
            vm.$refs.mainLoadingScreen.classList.add("fade-out");
            vm.$refs.mainLoadingScreen.style.display = "none";
            vm.$refs.mainContent.style.display = "block";
            vm.$modal.show("introModal");
        },

        showSettingsModal() {
            this.$modal.show("settingsModal");
        },

        toggleMonitor() {
            // this.$root.$refs.mixerDat.guiMixer.hide();
            this.$root.$refs.monitor.pane.hidden = !this.$root.$refs.monitor.pane.hidden;
        },
        toggleMixer(){
            this.$root.$refs.mixer.pane.hidden = !this.$root.$refs.mixer.pane.hidden;
        },
        transposeOctUp() {
            this.keyboardoctaveStart += 1;
            this.keyboardoctaveEnd += 1;
        },

        transposeOctDown() {
            this.keyboardoctaveStart -= 1;
            this.keyboardoctaveEnd -= 1;
        },

        modalCallback() {
            this.$store.commit("changeModalStatus");
        },

        calculateMaxBPM() {
            const vm = this;
            const dt = vm.modelInferenceTimes.sort(function (a, b) { return a - b })[Math.floor(vm.modelInferenceTimes.length * 0.95)];
            vm.maxBPM = Math.round(1000 * 60 / dt / vm.$store.getters.getTicksPerBeat);
        },

        buttonAction(buttonId) {
            // use paramWriter to write a parameter to the worker
            const buttonPropertyName = `BUTTON_${buttonId}`;
            if (this.paramWriter != null &&
                !this.paramWriter.enqueue_change(this.uiParameterType[buttonPropertyName], 1.0)) {
                console.warn("Couldn't enqueue.");
            }
        },

        handleMixerUpdate(event) {
            // console.log('in handler ', event);
            this.$store.commit("handleMixerUpdate", event);
        },

        loadConfigSync() {
            // Read about sync and async requests here:
            // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Synchronous_and_Asynchronous_Requests
            // In our case, we need to load the config asap, since 
            // the config contains also info to generate the UI.
            // If not, the app will crash anyway, so it's worth waiting for it.

            // First, load all the configs files and merge them into one
            let configFilesURL = this.configFiles.map((file) => {
                return `/workers/${this.workerName}/${file}`;
            });
            // get all files using xhr
            let xhrs = configFilesURL.map((url) => {
                const xhr = new XMLHttpRequest();
                xhr.open("GET", url, false); // Set async to false
                xhr.send();
                return xhr;
            });
            // go over the xhrs, check which are 200, and concat them
            // for the rest of the files, throw an error
            let config = "";
            xhrs.forEach((xhr) => {
                if (xhr.status === 200) {
                config += xhr.responseText + "\n";
                } else {
                throw new Error(`Failed to fetch config file: ${xhr.status}`);
                }
            });

            if (config === "") {
                throw new Error("Failed to fetch config file: empty");
            } else {
                this.config = yaml.load(config);
            }
        },
    },

    computed: {
        // This copies the switches array to computedSwitches
        // so that we can watch() the computedSwitches while
        // havin access to the old switches array.
        // https://github.com/vuejs/vue/issues/2164
        computedSwitches: function () {
            return this.switches.map(a => { return { ...a } })
        },

        computedSliders: function () {
            return this.sliders.map(a => { return { ...a } })
        },
        audioAndMeter: function () {
            return this.config.gui.audioMeter.status && this.config.interactionMode.audioMode;
        },
        audioAndChroma: function () {
            return this.config.gui.chromaChart.status && this.config.interactionMode.audioMode;
        }
    },

    watch: {
        screenWidth: {
            // At every screenWidth data change, this would automatically change the keyboard's octave number.
            immediate: true,
            handler(newValue) {
                let octaves;
                if (newValue <= 750) {
                octaves = 2;
                } else if (newValue <= 1024) {
                // for iPads. 1024 * 768.
                octaves = 3;
                } else if (newValue <= 1366) {
                // for iPad Pros. 1366 * 1024.
                octaves = 4;
                } else if (newValue <= 1920) {
                // for 1920 * 1080 screens.
                octaves = 5;
                } else {
                octaves = 6;
                }
                this.keyboardoctaveEnd = this.keyboardoctaveStart + octaves;
                // A trick, to force keyboard re-render itself.
                this.keyboardKey += 1;
            },
        },

        misalignErrCount: {
            immediate: true,
            handler(newValue) {
                if (newValue == 10) {
                this.$toasted.show(
                    "Your local machine cannot run inference at this speed. Try lowering the BPM."
                );
                }
            },
        },

        keyboardoctaveStart: {
            immediate: true,
            handler(newValue) {
                // A trick, to force keyboard re-render itself.
                this.keyboardKey += 1;
            },
        },

        localBPM: {
            immediate: true,
            handler(newValue) {
                console.log("localBPM changed to ", newValue);
                this.$store.commit("setBPM", newValue);
            },
        },

        computedSwitches: {
            // immediate: true,
            deep: true,
            handler(newStates, oldStates) {
                newStates.forEach((newState, index) => {
                    let oldStatus = oldStates.length == 0 ? null : oldStates[index].status;
                    if ( newState.status !== oldStatus) {
                        let floatStatus = newState.status ? 1.0 : 0.0;
                        const switchPropertyName = `SWITCH_${index + 1}`;
                        if (
                            this.paramWriter != null &&
                            !this.paramWriter.enqueue_change(
                                this.uiParameterType[switchPropertyName],
                                floatStatus
                            )
                            ) {
                        console.warn("Couldn't enqueue.");
                        }
                    }
                });
            }
        },

        computedSliders: {
            // immediate: true,
            deep: true,
            handler(newStates, oldStates) {
                newStates.forEach((newState, index) => {
                let oldStatus = oldStates.length == 0 ? null : oldStates[index].status;
                if (newState.value !== oldStatus) {
                    // let floatStatus = newState.status ? 1.0 : 0.0;
                    const sliderPropertyName = `SLIDER_${index + 1}`;
                    console.log("detected ", sliderPropertyName, " change to ", newState.value);
                    if (
                        this.paramWriter != null &&
                        !this.paramWriter.enqueue_change(
                            this.uiParameterType[sliderPropertyName],
                            newState.value
                        )
                        ) {
                    console.warn("Couldn't enqueue.");
                    }
                }
                });
            }
        },
    }
}

</script>
<style>
@media (min-width: 1024px) {
.main {
    min-height: 100vh;
    display: flex;
    align-items: center;
}
}
</style>
