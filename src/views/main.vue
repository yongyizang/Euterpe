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
        <button @click="entryProgram" ref="entryBtn" class="entryBtn">
          Play
        </button>
        <p v-if="isNotChrome">
          We highly recommend using Chrome for better user experience.
        </p>
        <p v-if="isMobile">
          The model may not perform normally on mobile devices. We recommend
          using Desktop computers.
        </p>
      </div>
    </div>

    <div ref="mainContent" id="mainContent" class="fade-in" style="justify-content: center; align-items: center;">
      <div style="
          background-color: rgb(0, 0, 0);
          opacity: 0.5;
          display: fixed;
          top: 0;
          right: 0;
          z-index: 999;
          ">
      </div>
      <!-- Custom Vue UI Components -->
      <Score />
      <AudioMeter ref="audioMeter" :width=300 :height="100" :fft_bins="128" orientation="top"
        style="position:absolute; z-index:0; top:0px; left:0; background-color:transparent" />
      <ChromaChart ref="chromaChart" :width="300" :height="110"
        :styles="{ position: 'absolute', zIndex: 0, top: '10px', right: '0px', backgroundColor: 'transparent' }" />
      <PianoRoll style="position:absolute; z-index:-1; top:0; left:0" />
      <Keyboard id="pianoKeyboard" class="pianoKeyboard" ref="keyboard" :key="keyboardKey"
        :octave-start="keyboardoctaveStart" :octave-end="keyboardoctaveEnd" />
      <div style="position: absolute; bottom: 300px; right: 20px" background-color: transparent>
        <TextBox :initialText="textBoxText" />
      </div>
      <!-- On-screen buttons -->
      <div style="position: absolute; bottom: 230px; right: 20px">
        <md-button class="controlBtn" @click="toggleClock" style="width: 40px">
          <md-icon>{{ localSyncClockStatus ? "pause" : "play_arrow" }}</md-icon>
        </md-button>
        <md-button class="controlBtn" @click="showSettingsModal">
          <md-icon>settings</md-icon>
        </md-button>
        <md-button class="controlBtn" @click="showMixerModal">
          <md-icon>tune</md-icon>
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
                    <p class="settingsValue">{{ BPM }}</p>
                    <vue-slider v-model="BPM" :lazy="true" :min="60" :max="120" class="settingsSlider"></vue-slider>
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
                  <div v-for="sliderItem in sliders" :key="sliderItem.id"  class="md-layout-item md-large-size-25 md-alignment-center">
                    <VerticalSlider v-model="sliderItem.value" :min="sliderItem.min" :max=sliderItem.max :label="sliderItem.label" />
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
                        <toggle-button
                          color="#74601c"
                          v-model="swi.status"
                          style="transform: scale(0.9);"
                        />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </modal>
      <!-- Mixer Modal -->
      <modal name="mixerModal" :minHeight=600 :adaptive="true" @opened="modalCallback" @closed="modalCallback">
        <!-- overflow-y: scroll; -->
        <div style="padding:0; margin: 0; ">
          <div class="modalDiv">
            <p class="modalTitle">
              Audio Mixer
            </p>
            <button class="modalBtn" @click="$modal.hide('mixerModal')"><md-icon
                class="modalIcon">close</md-icon></button>
          </div>
          <div class="modalContent" style="overflow-y: scroll; height:600px">
            <p class="settingsSubtitle">User</p>
            <div class="md-layout md-gutter md-alignment-left" style="padding:20px">
              <div style="height:60px;padding-left:12px; padding-top:10px; min-width:120px;">
                <p style="height:15px;margin:0;line-height:0;">User Bus</p>
                <p style="height:35px;margin:0;line-height:15px;font-size:20px;font-weight:800">{{ humanVolume * 10 }} %
                </p>
              </div>
              <HorizontalSlider v-model="humanVolume" :min="1" :max="10" />
              <div style="display:block; min-width:60px; padding-top:17px">
                <span style="padding:0; margin:0;">Mute</span>
                <toggle-button color="#74601c" v-model="humanSamplerMuted" @change="toggleHumanSamplers"
                  style="transform: scale(0.9);" />
              </div>
            </div>

            <div class="md-layout md-gutter md-alignment-left" style="padding:20px">
              <div style="height:60px;padding-left:12px; padding-top:10px; min-width:120px;">
                <p style="height:15px;margin:0;line-height:0;">Upright Bass</p>
                <p style="height:35px;margin:0;line-height:15px;font-size:20px;font-weight:800">{{ humanUprightBassVolume
                  *
                  10 }} % </p>
              </div>
              <HorizontalSlider v-model="humanUprightBassVolume" :min="1" :max="10" />
              <div style="display:block; min-width:60px; padding-top:17px">
                <span style="padding:0; margin:0;">Mute</span>
                <toggle-button color="#74601c" v-model="humanUprightBassMuted" @change="togglehumanUprightBass"
                  style="transform: scale(0.9);" />
              </div>
            </div>

            <p class="settingsSubtitle">Metronome</p>
            <div class="md-layout md-gutter md-alignment-left" style="padding:20px">
              <div style="height:60px;padding-left:12px; padding-top:10px; min-width:120px;">
                <p style="height:15px;margin:0;line-height:0;">Metronome</p>
                <p style="height:35px;margin:0;line-height:15px;font-size:20px;font-weight:800">{{ metronomeVolume * 10 }}
                  %
                </p>
              </div>
              <HorizontalSlider v-model="metronomeVolume" :min="1" :max="10" />
              <div style="display:block; min-width:60px; padding-top:17px">
                <span style="padding:0; margin:0;">Mute</span>
                <toggle-button color="#74601c" :value="false" @change="toggleMetronomeSampler"
                  style="transform: scale(0.9);" />
              </div>
            </div>

            <p class="settingsSubtitle">Worker</p>
            <div class="md-layout md-gutter md-alignment-left" style="padding:20px">
              <div style="height:60px;padding-left:12px; padding-top:10px; min-width:120px;">
                <p style="height:15px;margin:0;line-height:0;">Worker Bus</p>
                <p style="height:35px;margin:0;line-height:15px;font-size:20px;font-weight:800">{{ workerVolume * 10 }} %
                </p>
              </div>
              <HorizontalSlider v-model="workerVolume" :min="1" :max="10" />
              <div style="display:block; min-width:60px; padding-top:17px">
                <span style="padding:0; margin:0;">Mute</span>
                <toggle-button color="#74601c" :value="false" @change="toggleWorkerSamplers"
                  style="transform: scale(0.9);" />
              </div>
            </div>
          </div>
        </div>
      </modal>
      <!-- Intro Modal -->
      <modal v-if="config.introModal" name="introModal" :adaptive="true" @opened="modalCallback" @closed="modalCallback">
        <div class="modalDiv">
          <p class="modalTitle">
            Introduction
          </p>
          <button class="modalBtn" @click="$modal.hide('introModal')"><md-icon class="modalIcon">close</md-icon></button>
        </div>
        <div class="modalContent">
          <p v-for="content in config.introModalContent">
            {{ content }}
            <br />
          </p>
        </div>
      </modal>

    </div>
  </div>
</template>

<script>
import "../css/main.css";
import * as Tone from "tone";
import { Midi } from "@tonaljs/tonal";
import Keyboard from "@/components/Keyboard.vue";
import PianoRoll from "@/components/PianoRoll.vue";
import Score from "@/components/Score.vue";
import VerticalSlider from '@/components/VerticalSlider.vue'
import HorizontalSlider from '@/components/HorizontalSlider.vue'
import AudioMeter from "../components/AudioMeter.vue";
import ChromaChart from "../components/ChromaChart.vue";
import TextBox from "../components/TextBox.vue";
import { WebMidi } from "webmidi";
import Dropdown from "vue-simple-search-dropdown";
import AudioKeys from "audiokeys";
import yaml from "js-yaml";
import * as rb from "ringbuf.js"; // /dist/index.js
import { messageType, statusType, noteType, uiParameterType, workerParameterType } from '@/utils/types.js'
import { URLFromFiles, isMobile, isNotChrome } from '@/utils/helpers.js'
import { sliders, buttons, switches} from '@/utils/widgets_config.js'

// This is for Web Audio restrictions, we need to make an user behavior to trigger the Tone.start() function.
window.onclick = () => {
  // TODO : this calls Tone.start() every time the user clicks on the screen.
  // Tone.start();
};

export default {
  name: "mainScreen",

  data() {
    return {
      config: null,

      messageType,
      statusType,
      noteType,
      uiParameterType,
      workerParameterType,

      switches,
      sliders,
      buttons,

      workerName: "arpeggiator",

      BPM: null,
      randomness: null,
      localSyncClockStatus: false, // used to trigger local UI change
      screenWidth: document.body.clientWidth,
      screenHeight: document.body.clientHeight,
      keyboardKey: 0,
      keyboardoctaveStart: 2,
      keyboardoctaveEnd: 6,

      audioContext: null,
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
      
      textBoxText: "Gm7/D",

      workerParameterInterval: null,

      WebMIDISupport: false,
      pageLoadTime: null,
      modelLoadTime: null,
      activeDevices: [],
      selectedMIDIDevice: "",

      humanVolume: 5,
      humanSamplerMuted: false,
      humanUprightBassVolume: 5,
      humanUprightBassMuted: false,
      workerVolume: 5,
      metronomeVolume: 5,

      // used to calculate the average worker inference time (clockBased mode) 
      // and estimate maxBPM
      modelInferenceTimes: [],
      // maxBPM (or min clock period) supported by the current device
      maxBPM: 0,
      // counter for the number of times the worker inference time exceeds the clock period
      misalignErrCount: 0,

      isNotChrome,
      isMobile,

    };
  },

  components: {
    Keyboard,
    Score,
    PianoRoll,
    VerticalSlider,
    HorizontalSlider,
    Dropdown,
    AudioMeter,
    ChromaChart,
    TextBox
  },

  created() {
    // that's a necessary trick. 
    // The actuall config values will
    // be loaded in mounted() 
    this.config = {
      'introModal': null,
      'title': '',
      'subtitle': '',
      'introModalContent': [],
    };
  },

  async mounted() {

    var vm = this;
    /*
     * Loading Animation: set initial status of both div
     */
    vm.$refs.mainContent.style.display = "none";
    vm.$refs.entryBtn.style.visibility = "hidden";

    // load config.yaml and constants.json
    // then commit them to any vuex store that needs them
    try {
      await fetch(`/workers/${vm.workerName}/config.yaml`)
        .then(response => response.text())
        .then(text => function () {
          this.config = yaml.load(text);
          this.$store.commit("setConfig", this.config);
          this.$store.commit("initQuantBuffers", this.config);
          this.$store.commit("setTicksPerMeasure", this.config);
        }.bind(this)());
    } catch (err) {
      console.error(err);
    }

    vm.BPM = vm.config.clockBasedSettings.tempo;

    vm.audioContext = new AudioContext;
    Tone.context.lookAhead = 0.01;

    // Initialize worker
    // experiment with , { type : 'module' }
    vm.worker = new Worker(`/workers/${vm.workerName}/worker.js`);
    vm.worker.onmessage = vm.workerCallback;

    // Send a message to worker with some necessary 
    // configurations and constants to store inside the worker
    await vm.worker.postMessage({
      messageType: vm.messageType.LOAD_CONFIG,
      content: {
        config: vm.config,
        messageType: vm.messageType,
        statusType: vm.statusType,
        noteType: vm.noteType,
        uiParameterType: vm.uiParameterType,
        workerParameterType: vm.workerParameterType,
      }
    });
    // Tell the worker to load the algorithm
    await vm.worker.postMessage({
      messageType: vm.messageType.LOAD_ALGORITHM,
      content: null,
    });

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

    await vm.worker.postMessage({
      messageType: vm.messageType.INIT_AUDIO,
      content: {
        sab: vm.sab,
        sab_par_ui: vm.sab_par_ui,
        sab_par_worker: vm.sab_par_worker,
        channelCount: 2,
        sampleRate: vm.audioContext.sampleRate,
      }
    });

    vm.workerParameterInterval = setInterval(vm.workerParameterObserver, 10);
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

    const recorderWorkletUrl = await URLFromFiles(['recorder-worklet.js', 'libraries/index_rb.js'])
    await vm.audioContext.audioWorklet.addModule(recorderWorkletUrl);

    vm.audioContext.resume(); // ?

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
      // sound/sampler is active even when the improvisation (clock) has not started yet
      const midiEvent = {
        type: vm.noteType.NOTE_ON,
        player: "human",
        instrument: "upright_bass",
        name: noteName, //message.note.identifier,
        channel: 140, // this is channel midi channel 0
        midi: note.note,
        velocity: 127,
        timestamp: {
          seconds: Tone.now(),
          tick: vm.$store.getters.getGlobalTickDelayed,
        },
        playAfter: {
          seconds: 0,
          tick: 0
        }
      }

      // We always send the user's input directly to the sampler
      // for immediate playback
      vm.$store.dispatch("samplerOn", midiEvent);
      // If the clock is running, send the note to the piano roll
      if (vm.$store.getters.getClockStatus) {

        // If eventBased mode, send an NOTE_EVENT MICP packet to the worker
        // this packet will be sent to the processNoteEvent hook.
        if (vm.config.noteBasedMode.eventBased) {
          vm.worker.postMessage({
            messageType: vm.messageType.NOTE_EVENT,
            content: midiEvent,
          });
        };

        vm.$root.$refs.pianoRoll.keyDown(midiEvent);
        vm.$store.dispatch("noteOn", midiEvent);
      }
    });

    // callback for when a laptop keyboard key is released
    keyboard.up(function (note) {
      let noteName = Midi.midiToNoteName(note.note, { sharps: true });

      const midiEvent = {
        type: vm.noteType.NOTE_OFF,
        player: "human",
        instrument: "upright_bass",
        name: noteName, //message.note.identifier,
        channel: 140, // this is channel midi channel 0
        midi: note.note,
        velocity: 127,
        timestamp: {
          seconds: Tone.now(),
          tick: vm.$store.getters.getGlobalTickDelayed, //null,//this.$store.getters.getGlobalTickDelayed
        },
        playAfter: {
          seconds: 0,
          tick: 0
        }
      }

      vm.$store.dispatch("samplerOff", midiEvent);
      if (vm.$store.getters.getClockStatus) {
        // this enters here, only when the clock has started

        if (vm.config.noteBasedMode.eventBased) {
          vm.worker.postMessage({
            messageType: vm.messageType.NOTE_EVENT,
            content: midiEvent,
          });
        };
        vm.$root.$refs.pianoRoll.keyUp(midiEvent);
        vm.$store.dispatch("noteOff", midiEvent);
      }
    });
    // TODO: window.onclick is outside mounted(). How about this one.
    // When window resize, self-update this data.
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
      if (event.code == 32 && !vm.$store.getters.getModalStatus) {
        // spacebar could toggle clock
        vm.toggleClock();
      }
    });

    vm.screenWidth = document.body.clientWidth;
    vm.screenHeight = document.body.clientHeight;

    // Block lower resolutions.
    const loadingScreen = document.getElementById("loadingScreenInjection");
    if (vm.screenWidth < 450 || vm.screenHeight < 450) {
      loadingScreen.innerHTML =
        "<p style='font-size:20px;line-height:35px;padding:40px;'>We are sorry, but we only support larger screens for now.<br />Please visit us on desktop or larger tablets.</p>";
    }

    // TODO: Do we need those?
    /*
     * Initialize page load data collections
     */
    vm.userAgent = navigator.userAgent;
    vm.pageLoadTime =
      window.performance.timing.domContentLoadedEventEnd -
      window.performance.timing.navigationStart;
    vm.modelLoadTime = Date.now();

  },

  computed: {
    // This copies the switches array to computedSwitches
    // so that we can watch() the computedSwitches while
    // havin access to the old switches array.
    // https://github.com/vuejs/vue/issues/2164
    computedSwitches: function() {
        return this.switches.map(a => {return {...a}})
    },
    computedSliders: function() {
        return this.sliders.map(a => {return {...a}})
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
    BPM: {
      immediate: true,
      handler(newValue) {
        this.$store.commit("setBPM", newValue);
      },
    },
    computedSwitches: {
      // immediate: true,
      deep: true,
      handler(newStates, oldStates) {
        newStates.forEach((newState, index) => {
          if (newState.status !== oldStates[index].status) {
            let floatStatus = newState.status ? 1.0 : 0.0;
            const switchPropertyName = `SWITCH_${index + 1}`;
            if (
              this.paramWriter != null &&
              !this.paramWriter.enqueue_change(
                this.uiParameterType[switchPropertyName],
                floatStatus
              )
            ) {
              console.error("Couldn't enqueue.");
            }
          }
        });
      }
    },
    computedSliders: {
      // immediate: true,
      deep: true,
      handler(newStates, oldStates) {
        console.log(newStates[0])
        newStates.forEach((newState, index) => {
          console.log("skata");
          if (newState.value !== oldStates[index].value) {
            // let floatStatus = newState.status ? 1.0 : 0.0;
            const sliderPropertyName = `SLIDER_${index + 1}`;
            if (
              this.paramWriter != null &&
              !this.paramWriter.enqueue_change(
                this.uiParameterType[sliderPropertyName],
                newState.value
              )
            ) {
              console.error("Couldn't enqueue.");
            }
          }
        });
      }
    },

    humanVolume: {
      immediate: true,
      handler(newValue) {
        // if (!this.paramWriter.enqueue_change(1, newValue)) {
        //   console.error("Couldn't enqueue.");
        // }
        this.$store.commit("setHumanVolume", newValue);
      },
    },
    humanUprightBassVolume: {
      immediate: true,
      handler(newValue) {
        let payload = {
          instrument: "upright_bass",
          volume: newValue,
        };
        this.$store.commit("setHumanSamplerVolume", payload);
      },
    },
    workerVolume: {
      immediate: true,
      handler(newValue) {
        // if (!this.paramWriter.enqueue_change(2, newValue)) {
        //   console.error("Couldn't enqueue.");
        // }
        this.$store.commit("setWorkerVolume", newValue);
      },
    },
    metronomeVolume: {
      immediate: true,
      handler(newValue) {
        this.$store.commit("setMetronomeVolume", newValue);
      },
    },
  },

  methods: {

    workerParameterObserver() {
      let newParameterWorker = { index: null, value: null };
      if (this.paramReader.dequeue_change(newParameterWorker)) {
        switch (newParameterWorker.index) {
          case this.workerParameterType.INFERENCE_TIME:
            this.modelInferenceTimes.push(newParameterWorker.value);
            break;
          case this.workerParameterType.RMS:
            break;
          case this.workerParameterType.LOUDNESS:
            break;
          default:
            console.log("Unknown parameter index: " + newParameterWorker.index + 
                        " make sure you have registerd it in utils/types.js");
        }
      }
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
        const midiEvent = {
          type: vm.noteType.NOTE_ON,
          player: "human",
          name: message.note.identifier,
          channel: message.data[0],
          midi: message.data[1],
          velocity: message.data[2],
          timestamp: {
            seconds: message.timestamp,
            tick: this.$store.getters.getGlobalTickDelayed
          },
          playAfter: {
            seconds: 0,
            tick: 0
          }
        }

        this.$store.dispatch("samplerOn", midiEvent);
        if (this.$store.getters.getClockStatus) {

          if (vm.config.noteBasedMode.eventBased) {
            vm.worker.postMessage({
              messageType: vm.messageType.NOTE_EVENT,
              content: midiEvent,
            });
          };
          this.$root.$refs.pianoRoll.keyDown(midiEvent);
          this.$store.dispatch("noteOn", midiEvent);
        }
      });

      inputDevice.addListener("noteoff", (message) => {
        const midiEvent = {
          type: vm.noteType.NOTE_OFF,
          player: "human",
          name: message.note.identifier,
          channel: message.data[0],
          midi: message.data[1],
          velocity: message.data[2],
          timestamp: {
            seconds: message.timestamp,
            tick: this.$store.getters.getGlobalTickDelayed
          },
          playAfter: {
            seconds: 0,
            tick: 0
          }
        }

        this.$store.dispatch("samplerOff", midiEvent);
        if (this.$store.getters.getClockStatus) {

          if (vm.config.noteBasedMode.eventBased) {
            vm.worker.postMessage({
              messageType: vm.messageType.NOTE_EVENT,
              content: midiEvent,
            });
          };
          this.$root.$refs.pianoRoll.keyUp(midiEvent);
          this.$store.dispatch("noteOff", midiEvent);
        }
      });
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

    /*
     * neural network web worker's callback and worker call methods.
     * Called every tick, and processes the AI's output.
     */

    runTheWorker() {
      const vm = this;
      // For both GRID and CONTINUOUS modes, we also quantize the user input to the clock grid
      // it's up to the worker to use it if it wants to.
      this.estimateHumanQuantizedNote();


      // remember, runTheWorker happens with a small delay of tick/4 after the tick
      // here I just keep track of the 'delayed' tick
      this.$store.commit("incrementTickDelayed");

      // MAJOR TODO : draw should probably go before the delayedTickIncrement
      if (vm.config.gui.score === true) {
        this.$root.$refs.score.draw();
      }

      this.worker.postMessage({
        messageType: vm.messageType.CLOCK_EVENT,
        content: {
          tick: this.$store.getters.getLocalTick,
          humanQuantizedInput: this.$store.getters.getHumanInputFor(this.$store.getters.getLocalTick),
          humanContinuousBuffer: this.$store.getters.getMidiEventBuffer,
        }
      })
    },

    async workerCallback(e) {
      const vm = this;
      if (e.data.messageType === vm.messageType.CLOCK_EVENT) {
        // console.log("worker callback EVENTS BUFFER for tick", e.data.content.tick);

        const workerPrediction = e.data.content;
        const noteEventsList = workerPrediction.events;
        noteEventsList.forEach((noteEvent) => {
          if (noteEvent.playAfter.tick > 0) {
            this.$store.dispatch("storeWorkerQuantizedOutput", noteEvent);
          } else {
            if (noteEvent.type === vm.noteType.NOTE_ON) {
              this.$store.dispatch("samplerOn", noteEvent);
              // set a timeout to call keyDown based on noteEvent.timestamp.seconds
              setTimeout(() => {
                this.$root.$refs.pianoRoll.keyDown(noteEvent);
              }, noteEvent.playAfter.seconds * 1000);
            }
            else if (noteEvent.type === vm.noteType.NOTE_OFF) {
              this.$store.dispatch("samplerOff", noteEvent);
              // set a timeout to call keyUp based on noteEvent.timestamp.seconds
              setTimeout(() => {
                this.$root.$refs.pianoRoll.keyUp(noteEvent);
              }, noteEvent.playAfter.seconds * 1000);
            }
          }
        });

        // Misalignment Check
        // Will block first 2 ticks' misalignment error msg
        if ((workerPrediction.tick !== this.$store.getters.getLocalTickDelayed) && (this.$store.getters.getGlobalTick > 2)) {
          this.$toasted.show(
            "Network tick misalignment: expecting " +
            this.$store.getters.getLocalTickDelayed +
            ", got " +
            workerPrediction.tick
          );
          this.misalignErrCount += 1;
        }

        // this.$store.dispatch("storeWorkerQuantizedOutput", workerPrediction);

        this.reset = false; // for explanation see the comment about reset inside runTheWorker()
      }
      else if (e.data.messageType == vm.messageType.NOTE_EVENT) {
        // console.log("worker callback NOTE_EVENT on tick", this.$store.getters.getLocalTick, "/", this.$store.getters.getGlobalTick, ", del:", this.$store.getters.getLocalTickDelayed, this.$store.getters.getGlobalTickDelayed);
        const workerPrediction = e.data.content;
        const noteEventsList = workerPrediction.events;
        noteEventsList.forEach((noteEvent) => {
          if (noteEvent.playAfter.tick > 0) {
            this.$store.dispatch("storeWorkerQuantizedOutput", noteEvent);
          } else {
            if (noteEvent.type === vm.noteType.NOTE_ON) {
              this.$store.dispatch("samplerOn", noteEvent);
              // set a timeout to call keyDown based on noteEvent.timestamp.seconds
              setTimeout(() => {
                this.$root.$refs.pianoRoll.keyDown(noteEvent);
              }, noteEvent.playAfter.seconds * 1000);
            }
            else if (noteEvent.type === vm.noteType.NOTE_OFF) {
              this.$store.dispatch("samplerOff", noteEvent);
              // set a timeout to call keyUp based on noteEvent.timestamp.seconds
              setTimeout(() => {
                this.$root.$refs.pianoRoll.keyUp(noteEvent);
              }, noteEvent.playAfter.seconds * 1000);
            }
          }
        });
      }
      else if (e.data.messageType === vm.messageType.STATUS) {
        if (e.data.statusType == vm.statusType.SUCCESS) {
          vm.$refs.entryBtn.classList.add("fade-in");
          vm.$refs.entryBtn.style.visibility = "visible";
          vm.modelLoadTime = Date.now() - vm.modelLoadTime;
        }
        const workerStatus = vm.$refs.workerStatus;
        workerStatus.innerHTML = e.data.content;
      }
      else if (e.data.messageType === vm.messageType.AUDIO_BUFFER) {
        // console.log("worker callback AUDIO BUFFER on tick", this.$store.getters.getLocalTick, "/", this.$store.getters.getGlobalTick, ", del:", this.$store.getters.getLocalTickDelayed, this.$store.getters.getGlobalTickDelayed);

        const audio = new Float32Array(e.data.content);
        // create an AudioBuffer from the audio
        const audioBuffer = new AudioBuffer({
          numberOfChannels: 1,
          length: audio.length,
          sampleRate: 44100
        });
        audioBuffer.copyToChannel(audio, 0);

        // play AudioBuffer
        // vm.workerPlayer.buffer = audioBuffer;
        // vm.workerPlayer.start();
      }
      else if (e.data.messageType === vm.messageType.WAV_BUFFER) {
        var a = document.createElement('a');
        a.style.display = 'none';
        document.body.appendChild(a);
        const blob = new Blob([e.data.content], { type: 'audio/wav' });
        a.href = URL.createObjectURL(blob);
        a.download = `audio-${(new Date()).toISOString().replace(/[^0-9]/g, "")}.wav`;
        a.click();
      }
      else if (e.data.messageType === vm.messageType.CHROMA_VECTOR) {
        this.$root.$refs.chromaChart.updateChromaData(e.data.content);
      }
      else if (e.data.messageType === vm.messageType.CHORD_TEXT) {
        this.textBoxText = 'New Text';
      }

    },

    triggerWorkerSamplerSync() {
      var vm = this;
      const workerNotesToBePlayed = this.$store.getters.popWorkerNotesToBePlayedAt(
        this.$store.getters.getGlobalTick
      );

      if (workerNotesToBePlayed.length > 0) {
        workerNotesToBePlayed.forEach((noteEvent) => {
          // console.log("a note to be played", noteEvent);
          if (noteEvent.type === vm.noteType.NOTE_ON) {
            // console.log("worker note on", noteEvent)
            this.$store.dispatch("samplerOn", noteEvent);
            setTimeout(() => {
              this.$root.$refs.pianoRoll.keyDown(noteEvent);
            }, noteEvent.playAfter.seconds * 1000);
            // this.$root.$refs.pianoRoll.keyDown(note);
          } else if (noteEvent.type === vm.noteType.NOTE_OFF) {
            // console.log("WORKER NOTE OFF", noteEvent)
            this.$store.dispatch("samplerOff", noteEvent);
            // this.$root.$refs.pianoRoll.keyUp(note);
            setTimeout(() => {
              this.$root.$refs.pianoRoll.keyUp(noteEvent);
            }, noteEvent.playAfter.seconds * 1000);
          }
        });
      }
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
            .map((e, i) => (e.type === vm.noteType.NOTE_ON && e.midi === elem.midi && e.timestamp.seconds < elem.timestamp.seconds) ? i : -1)
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
          const noteHoldEvent = {
            type: vm.noteType.NOTE_HOLD,
            player: "human",
            midi: midi,
            chroma: null,
            velocity: null,
            timestamp: {
              seconds: null,
              ticks: null,
            },
          }
          currentQuantizedEvents.push(noteHoldEvent);
          // currentQuantizedEvents.push({
          //   type: "hold",
          //   midi: midi,
          // })
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
      if (onHoldEvents.length > vm.config.polyphony.input) {
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

    // Initialize clock recursive function.
    // At each clock tick, this method would wait for a tick's time to call next tick.
    async toggleClock() {
      var vm = this;
      if (!vm.localSyncClockStatus) {
        vm.startRecording();
      } else {
        vm.stopRecording();
      }
      vm.localSyncClockStatus = !vm.localSyncClockStatus;
      // Allowing tickNumber to add to itself.
      vm.$store.commit("changeClockStatus");
      // clear pianoState
      vm.$store.commit("clearPianoState");

      // If the clock is not yet initialized...
      if (!vm.$store.getters.getClockInitialized) {
        // Then set it to intialized
        vm.$store.commit("initializeClock");
        // And intialized it.

        // Clock behavior function.
        async function tickBehavior() {
          if (vm.$store.getters.getClockStatus) {
            vm.$store.commit("incrementTick");


            vm.metronomeTrigger();
            // in grid-based mode, the worker's sampler is triggered in sync with the clock

            vm.triggerWorkerSamplerSync();


            // run the worker with a small delay of tick/4 in order to include 
            // any notes that the user played very close to the tick change.
            // this makes the grid a bit more flexible, and the human input is correctly parsed
            // In terms of playability, the human finds it much more easy to play along the metronome on the grid
            if (vm.config.noteBasedMode.clockBased) {
              setTimeout(function () {
                vm.runTheWorker();
              }, parseInt(vm.$store.getters.getClockPeriod / 4));
            } else {
              // inside runTheWorker we increment the "delayed" tick number.
              // If we don't run the worker, we still want to increment the "delayed" tick number
              // because other parts of the code depend on it. In this case tick === delayedTick
              vm.$store.commit("incrementTickDelayed");
            }
            // vm.runTheWorker();
          }
        }

        function sendOutTicks() {
          tickBehavior();
          setTimeout(sendOutTicks, vm.$store.getters.getClockPeriod);
        }

        sendOutTicks();
      }
    },

    /*
     * metronome status.
     */
    toggleMetronomeSampler() {
      // This method would update the status of metronome in Vuex Store.
      // this.$store.commit("muteMetronome");
      this.$store.commit("flipMetronomeSamplerMuteStatus");
    },
    toggleHumanSamplers() {
      this.$store.commit("flipHumanSamplersMuteStatus");
    },
    toggleWorkerSamplers() {
      this.$store.commit("flipWorkerSamplersMuteStatus");
    },

    // example code for toggle a sampler.
    togglehumanUprightBass() {
      console.log(this.humanUprightBassMuted)
      if (this.humanUprightBassMuted) {
        this.$store.commit("unmuteHumanSampler", "upright_bass");
      } else {
        this.$store.commit("muteHumanSampler", "upright_bass");
      }
      this.humanUprightBassMuted = !this.humanUprightBassMuted;
    },

    metronomeTrigger() {
      // console.log("in metronomeTrigger for ", this.$store.getters.getLocalTick);
      // var vm = this;
      // This method would trigger the metronome sampler.
      if (
        // getTicksPerBeat returns the number of ticks per beat
        // and we want the metronome to trigger every beat
        this.$store.getters.getLocalTick % this.$store.getters.getTicksPerBeat ==
        0
      ) {
        var currentNote =
          this.$store.getters.getLocalTick % this.$store.getters.getTicksPerMeasure === 0 ? "G0" : "C0";
        const metronomeNote = {
          player: "metronome",
          name: currentNote,
          type: this.noteType.NOTE_ON,
          midi: null,
          chroma: null,
          velocity: 127,
          playAfter: {
            tick: 0,
            seconds: 0
          }
        }
        this.$store.dispatch("samplerOn", metronomeNote);
        this.calculateMaxBPM();
      }
    },
    startRecording() {
      this.recorderWorkletNode.parameters.get('recordingStatus').setValueAtTime(1, this.audioContext.currentTime);
    },

    stopRecording() {
      this.recorderWorkletNode.parameters.get('recordingStatus').setValueAtTime(0, this.audioContext.currentTime);
      this.worker.postMessage({
        messageType: this.messageType.PREPARE_WAV,
        content: {}
      });
    },

    showSettingsModal() {
      this.$modal.show("settingsModal");
    },
    showMixerModal() {
      this.$modal.show("mixerModal");
    },

    hideSettingsModal() {
      this.$modal.hide("settingsModal");
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
      // console.log("maxBPM", vm.maxBPM);
    },

    buttonAction(buttonId){
      // use paramWriter to write a parameter to the worker
      const buttonPropertyName = `BUTTON_${buttonId}`;
      if (this.paramWriter != null &&
          !this.paramWriter.enqueue_change(this.uiParameterType[buttonPropertyName], 1.0)) {
          console.error("Couldn't enqueue.");
      }
    },
  },
};
</script>