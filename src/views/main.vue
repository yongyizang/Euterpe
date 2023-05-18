<template>
  <!--
      main.vue, the application's main UI file.
  -->
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

    <div ref="mainContent" id="mainContent" class="fade-in">
      <div style="
          background-color: black;
          opacity: 0.5;
          display: fixed;
          top: 0;
          right: 0;
          z-index: 999;
          ">
      </div>
      <scoreUI />
      <pianoRollUI />
      <div style="position: absolute; bottom: 230px; right: 20px">
        <md-button class="controlBtn" @click="toggleClock" style="width: 40px">
          <md-icon>{{ localSyncClockStatus ? "pause" : "play_arrow" }}</md-icon>
          <span> {{ localSyncClockStatus ? "Pause" : "Play" }}</span>
        </md-button>
        <md-button class="controlBtn" @click="showSettingsModal">
          <md-icon>settings</md-icon>
          <span> Settings </span>
        </md-button>
      </div>
      <md-button v-if="keyboardUIoctaveEnd !== 8" @click="transposeOctUp" class="md-icon-button md-raised"
        style="position: absolute; right: 20px; bottom: 100px">
        <md-icon>arrow_forward</md-icon>
      </md-button>
      <md-button v-if="keyboardUIoctaveStart !== 0" @click="transposeOctDown" class="md-icon-button md-raised"
        style="position: absolute; left: 20px; bottom: 100px">
        <md-icon>arrow_back</md-icon>
      </md-button>
      <keyboardUI id="pianoKeyboard" class="pianoKeyboard" ref="usersKeyboardUIref" :key="keyboardUIKey"
        :octave-start="keyboardUIoctaveStart" :octave-end="keyboardUIoctaveEnd" />
      <modal name="settingsModal" :minHeight=600 :adaptive="true" @opened="modalCallback" @closed="modalCallback">
        <div style="padding:0; margin: 0">
          <div class="modalDiv">
            <p class="modalTitle">
              Settings
            </p>
            <button class="modalBtn" @click="$modal.hide('settingsModal')"><md-icon
                class="modalIcon">close</md-icon></button>
          </div>
          <div class="modalContent">
            <p class="settingsSubtitle">Audio</p>
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
              <div class="md-layout-item md-small-size-50 md-xsmall-size-100">
                <div class="settingsDiv">
                  <span class="settingsOptionTitle">Metronome</span>
                  <toggle-button color="#74601c" :value="false" @change="toggleMetronome"
                    style="transform: scale(0.9); padding-top: 17px" />
                </div>
              </div>
              <div class="md-layout-item md-small-size-50 md-xsmall-size-100">
                <div class="settingsDiv">
                  <p class="settingsOptionTitle">Your Volume</p>
                  <p class="settingsValue">{{ userPianoVolume }}</p>
                  <vue-slider v-model="userPianoVolume" :lazy="true" :min="1" :max="10"
                    class="settingsSlider"></vue-slider>
                </div>
              </div>
              <div class="md-layout-item md-small-size-50 md-xsmall-size-100">
                <div class="settingsDiv">
                  <p class="settingsOptionTitle">Worker Volume</p>
                  <p class="settingsValue">{{ workerVolume }}</p>
                  <vue-slider v-model="workerVolume" :lazy="true" :min="1" :max="10" class="settingsSlider"></vue-slider>
                </div>
              </div>
              <div class="md-layout-item md-small-size-50 md-xsmall-size-100">
                <div class="settingsDiv">
                  <p class="settingsOptionTitle">Metronome Volume</p>
                  <p class="settingsValue">{{ metronomeVolume }}</p>
                  <vue-slider v-model="metronomeVolume" :lazy="true" :min="1" :max="10" class="settingsSlider"></vue-slider>
                </div>
              </div>
            </div>
            <p class="settingsSubtitle">MIDI</p>
            <div class="MIDIInput" v-if="WebMIDISupport">
              <Dropdown :options="activeDevices" v-on:selected="onMIDIDeviceSelectedChange"
                placeholder="Type here to search for MIDI device">
              </Dropdown>
            </div>
            <span v-else="WebMIDISupport">
              Currently, Using MIDI devices in browser is only supported by Google
              Chrome v43+, Opera v30+ and Microsoft Edge v79+. Please update to
              one of those browsers if you want to use Web MIDI
              functionalities.</span>
            <p class="settingsSubtitle">Network</p>
            <div class="md-layout md-gutter md-alignment-center">
              <div class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100">
                <div class="settingsDiv">
                  <p class="settingsOptionTitle">Randomness</p>
                  <p style="margin: 0; padding-bottom: 5px">
                    {{ this.number2RandomnessDescription(randomness) }}
                  </p>
                  <vue-slider v-model="randomness" :lazy="true" :tooltip="'none'" :min="1" :max="1000"></vue-slider>
                </div>
              </div>
              <div class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100">
                <md-button @click="resetNetwork" style="width: 100%">
                  <md-icon class="forceTextColor">close</md-icon>
                  <span class="forceTextColor">Reset Network</span>
                </md-button>
              </div>
            </div>
          </div>
        </div>
      </modal>
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
import keyboardUI from "@/components/keyboardUI.vue";
import pianoRollUI from "@/components/pianoRollUI.vue";
import scoreUI from "@/components/scoreUI.vue";
import { WebMidi } from "webmidi";
import Dropdown from "vue-simple-search-dropdown";
import AudioKeys from "audiokeys";
import yaml from "js-yaml";
import * as rb from "ringbuf.js"; // /dist/index.js
import * as rbInd from "ringbuf.js/dist/index.js";


// From a series of URL to js files, get an object URL that can be loaded in an
// AudioWorklet. This is useful to be able to use multiple files (utils, data
// structure, main DSP, etc.) without either using static imports, eval, manual
// concatenation with or without a build step, etc.
function URLFromFiles(files) {
  const promises = files.map((file) =>
    fetch(file).then((response) => response.text())
  );

  return Promise.all(promises).then((texts) => {
    const text = texts.join("");
    const blob = new Blob([text], { type: "application/javascript" });

    return URL.createObjectURL(blob);
  });
}


// This is for Web Audio restrictions, we need to make an user behavior to trigger the Tone.start() function.
window.onclick = () => {
  // TODO : this calls Tone.start() every time the user clicks on the screen.
  Tone.start();
};

export default {
  name: "mainScreen",

  data() {
    return {
      config: {
        'introModal': true,
        'title': '',
        'subtitle': '',
        'introModalContent': [],
      },
      messageType: null,
      statusType: null,
      BPM: null,
      randomness: null,
      localSyncClockStatus: false, // used to trigger local UI change
      screenWidth: document.body.clientWidth,
      screenHeight: document.body.clientHeight,
      keyboardUIKey: 0,
      keyboardUIoctaveStart: 2,
      keyboardUIoctaveEnd: 6,

      audioContext: null,
      mediaStreamSource: null,
      audioSettings: null,
      recorderWorkletNode: null,
      recorderWorkletBundle: null,
      audioBuffers: [],
      sab: null,
      osc: null,
      // workerPlayer: null,

      // reset signal to notify the Worker to reset.
      // If your worker doesn't support reseting, you can ignore this.
      reset: false,

      WebMIDISupport: false,
      pageLoadTime: null,
      modelLoadTime: null,
      activeDevices: [],
      selectedMIDIDevice: "",

      userPianoVolume: 5,
      workerVolume: 5,
      metronomeVolume: 5,

      // used to calculate the average worker inference time (clockBased mode) 
      // and estimate maxBPM
      modelInferenceTimes: [], 
      // maxBPM (or min clock period) supported by the current device
      maxBPM: 0,
      // counter for the number of times the worker inference time exceeds the clock period
      misalignErrCount: 0,

      isNotChrome: navigator.userAgent.indexOf("Chrome") <= -1,
      isMobile:
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
          navigator.userAgent
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
          navigator.userAgent.substr(0, 4)
        ),
      
    };
  },

  components: {
    keyboardUI,
    scoreUI,
    pianoRollUI,
    Dropdown,
  },

  async mounted() {
    var vm = this;
    vm.audioContext = new AudioContext();
    Tone.context.lookAhead = 0.01;


    /*
     * Loading Animation: set initial status of both div
     */
    this.$refs.mainContent.style.display = "none";
    this.$refs.entryBtn.style.visibility = "hidden";

    // load config.yaml and constants.json
    // then commit them to any vuex store that needs them
    try {
      await fetch('/config.yaml')
        .then(response => response.text())
        .then(text => function () {
          this.config = yaml.load(text);
          vm.$store.commit("setConfig", this.config);
          vm.$store.commit("initQuantBuffers", this.config);
          vm.$store.commit("setTicksPerMeasure", this.config);
          this.BPM = this.config.clockBasedSettings.tempo;
        }.bind(this)());
      await fetch('/constants.json')
        .then(response => response.json())
        .then(json => function () {
          this.messageType = json.messageType;
          this.statusType = json.statusType;
          this.noteTypes = json.noteTypes;
          vm.$store.commit("setNoteTypes", this.noteTypes);
        }.bind(this)());
      console.log("config and constants loaded");
    } catch (err) {
      console.error(err);
    }

    // Initialize worker
    // const workerUrl = await URLFromFiles(['template-worker.js', '/index_rb.js'])
    
    vm.worker = new Worker('template-worker.js');
    // set worker callback
    // this callback is triggered by worker.postMessage
    vm.worker.onmessage = vm.workerCallback;

    // Send a message to worker with the config file to store in worker
    await vm.worker.postMessage({
      messageType: vm.messageType.LOAD_CONFIG,
      content: vm.$store.getters.getConfig,
    });
    // Tell the worker to load the algorithm
    await vm.worker.postMessage({
      messageType: vm.messageType.LOAD_ALGORITHM,
      content: null,
    });

    // Prevent spacebar trigger any button
    document.querySelectorAll("button").forEach(function (item) {
      item.addEventListener("focus", function () {
        this.blur();
      });
    });

    // spacebar trigger play btn
    document.addEventListener("keypress", function (event) {
      if (event.keyCode == 32 && !vm.$store.getters.getModalStatus) {
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

    // SAB
    vm.sab = rb.RingBuffer.getStorageForCapacity(vm.audioContext.sampleRate * 2, Float32Array);

    await vm.worker.postMessage({
      messageType: vm.messageType.INIT_SAB,
      content: {
        sab: vm.sab,
        channelCount: 2,
        sampleRate: vm.audioContext.sampleRate,
      }
    });

    // setupWorker(sab, ac.sampleRate);
    // setupWebAudio(ac, sab);

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

    // vm.recorderStream = stream;
    // try {
    //   vm.recorderWorkletBundle = await URLFromFiles(['recorder-worklet.js', '@/../public/index_rb.js'])
    // } catch (err) {
    //   console.error(err);
    // }

    // const test = await fetch("/index_rb.js");

    const recorderWorkletUrl = await URLFromFiles(['recorder-worklet.js', '/index_rb.js'])
    // const resp = await fetch(url);
    // const blob = await resp.blob();
    // const reader = new FileReader();
    // reader.onload = function () {
    //   const content = reader.result;
    //   console.log(content);
    // };
    // reader.readAsText(blob);
    
    vm.audioContext.resume();

    await vm.audioContext.audioWorklet.addModule(recorderWorkletUrl);

    vm.osc = new OscillatorNode(vm.audioContext);
    var fm = new OscillatorNode(vm.audioContext);
    var gain = new GainNode(vm.audioContext);
    var panner = new StereoPannerNode(vm.audioContext);
    var panModulation = new OscillatorNode(vm.audioContext);

    vm.recorderWorkletNode = new AudioWorkletNode(
      vm.audioContext,
      "recorder-worklet", 
      {processorOptions: vm.sab}
    );

    panModulation.frequency.value = 2.0;
    fm.frequency.value = 1.0;
    gain.gain.value = 110;

    // panModulation.connect(panner.pan);
    // fm.connect(gain).connect(vm.osc.frequency);
    // vm.osc.connect(panner).connect(vm.audioContext.destination);
    // // panner.connect(vm.recorderWorkletNode);

    // vm.osc.start(0);
    // fm.start(0);
    // panModulation.start(0);
    // // vm.audioBuffers = [];

    vm.recorderWorkletNode.port.postMessage("ping")

    vm.recorderWorkletNode.port.addEventListener("message", (event) => {
      console.log("Received from Worklet" + event.data);
      // vm.worker.postMessage({
      //   messageType: vm.messageType.AUDIO_BUFFER,
      //   content: event.data,
      // });
    });
    // vm.recorderWorkletNode.port.start(); # TODO do I need this for ping/pong ?

    // vm.mediaStreamSource.connect(vm.recorderWorkletNode); // send the mic to the recorderNode --> recorderWorklet
    // vm.recorderWorkletNode.connect(vm.audioContext.destination);

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
        type: vm.noteTypes.NOTE_ON,
        player: "human",
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

        vm.$root.$refs.pianoRollUI.keyDown(midiEvent);
        vm.$store.dispatch("noteOn", midiEvent);
      }
    });

    // callback for when a laptop keyboard key is released
    keyboard.up(function (note) {
      let noteName = Midi.midiToNoteName(note.note, { sharps: true });

      const midiEvent = {
        type: vm.noteTypes.NOTE_OFF,
        player: "human",
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
        vm.$root.$refs.pianoRollUI.keyUp(midiEvent);
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
  },

  watch: {
    screenWidth: {
      // At every screenWidth data change, this would automatically change the keyboardUI's octave number.
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
        this.keyboardUIoctaveEnd = this.keyboardUIoctaveStart + octaves;
        // A trick, to force keyboardUI re-render itself.
        this.keyboardUIKey += 1;
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
    keyboardUIoctaveStart: {
      immediate: true,
      handler(newValue) {
        // A trick, to force keyboardUI re-render itself.
        this.keyboardUIKey += 1;
      },
    },
    BPM: {
      immediate: true,
      handler(newValue) {
        this.$store.commit("setBPM", newValue);
      },
    },
    randomness: {
      immediate: true,
      handler(newValue) {
        this.$store.commit("setRandomness", newValue / 1000);
      },
    },
    userPianoVolume: {
      immediate: true,
      handler(newValue) {
        this.$store.commit("setHumanVolume", newValue);
      },
    },
    workerVolume: {
      immediate: true,
      handler(newValue) {
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
          type: vm.noteTypes.NOTE_ON,
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
          this.$root.$refs.pianoRollUI.keyDown(midiEvent);
          this.$store.dispatch("noteOn", midiEvent);
        }
      });

      inputDevice.addListener("noteoff", (message) => {
        const midiEvent = {
          type: vm.noteTypes.NOTE_OFF,
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
          this.$root.$refs.pianoRollUI.keyUp(midiEvent);
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
      if (vm.config.gui.scoreUI === true){
        this.$root.$refs.scoreUI.draw();
      }

      this.worker.postMessage({
        messageType: vm.messageType.EVENTS_BUFFER,
        content: {
          tick: this.$store.getters.getLocalTick,
          humanQuantizedInput: this.$store.getters.getHumanInputFor(this.$store.getters.getLocalTick),
          humanContinuousBuffer: this.$store.getters.getMidiEventBuffer,
          randomness: this.$store.getters.getRandomness,
          reset: this.reset,
        }
      })
    },

    async workerCallback(e) {
      const vm = this;
      if (e.data.messageType === vm.messageType.EVENTS_BUFFER) {
        // console.log("worker callback EVENTS BUFFER for tick", e.data.content.tick);

        const workerPrediction = e.data.content;
        vm.modelInferenceTimes.push(workerPrediction.predictTime);
        const noteEventsList = workerPrediction.events;
        noteEventsList.forEach((noteEvent) => {
          if (noteEvent.playAfter.tick > 0) {
            this.$store.dispatch("storeWorkerQuantizedOutput", noteEvent);
          } else {
            if (noteEvent.type === vm.noteTypes.NOTE_ON){
              this.$store.dispatch("samplerOn", noteEvent);
              // set a timeout to call keyDown based on noteEvent.timestamp.seconds
              setTimeout(() => {
                this.$root.$refs.pianoRollUI.keyDown(noteEvent);
              }, noteEvent.playAfter.seconds * 1000);
            }
            else if (noteEvent.type === vm.noteTypes.NOTE_OFF){
              this.$store.dispatch("samplerOff", noteEvent);
              // set a timeout to call keyUp based on noteEvent.timestamp.seconds
              setTimeout(() => {
                this.$root.$refs.pianoRollUI.keyUp(noteEvent);
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
      else if(e.data.messageType == vm.messageType.NOTE_EVENT) {
      // console.log("worker callback NOTE_EVENT on tick", this.$store.getters.getLocalTick, "/", this.$store.getters.getGlobalTick, ", del:", this.$store.getters.getLocalTickDelayed, this.$store.getters.getGlobalTickDelayed);
        const workerPrediction = e.data.content;
        const noteEventsList = workerPrediction.events;
        noteEventsList.forEach((noteEvent) => {
          if (noteEvent.playAfter.tick > 0) {
            this.$store.dispatch("storeWorkerQuantizedOutput", noteEvent);
          } else {
            if (noteEvent.type === vm.noteTypes.NOTE_ON){
              this.$store.dispatch("samplerOn", noteEvent);
              // set a timeout to call keyDown based on noteEvent.timestamp.seconds
              setTimeout(() => {
                this.$root.$refs.pianoRollUI.keyDown(noteEvent);
              }, noteEvent.playAfter.seconds * 1000);
            }
            else if (noteEvent.type === vm.noteTypes.NOTE_OFF){
              this.$store.dispatch("samplerOff", noteEvent);
              // set a timeout to call keyUp based on noteEvent.timestamp.seconds
              setTimeout(() => {
                this.$root.$refs.pianoRollUI.keyUp(noteEvent);
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
      else if (e.data.messageType === vm.messageType.WAV_BUFFER){
        var a = document.createElement( 'a' );
        a.style.display = 'none';
        document.body.appendChild(a);
        const blob = new Blob([e.data.content], {type: 'audio/wav'});
        a.href = URL.createObjectURL( blob );
        a.download =  `audio-${(new Date()).toISOString().replace(/[^0-9]/g, "")}.wav`;
        a.click();
      }
    },

    resetNetwork() {
      this.reset = true;
    },

    triggerWorkerSamplerSync() {
      var vm = this;
      const workerNotesToBePlayed = this.$store.getters.popWorkerNotesToBePlayedAt(
        this.$store.getters.getGlobalTick
      );

      if (workerNotesToBePlayed.length > 0) {
        workerNotesToBePlayed.forEach((noteEvent) => {
          // console.log("a note to be played", noteEvent);
          if (noteEvent.type === vm.noteTypes.NOTE_ON) {
            // console.log("worker note on", noteEvent)
            this.$store.dispatch("samplerOn", noteEvent);
            setTimeout(() => {
                this.$root.$refs.pianoRollUI.keyDown(noteEvent);
              }, noteEvent.playAfter.seconds * 1000);
            // this.$root.$refs.pianoRollUI.keyDown(note);
          } else if (noteEvent.type === vm.noteTypes.NOTE_OFF) {
            // console.log("WORKER NOTE OFF", noteEvent)
            this.$store.dispatch("samplerOff", noteEvent);
            // this.$root.$refs.pianoRollUI.keyUp(note);
            setTimeout(() => {
                this.$root.$refs.pianoRollUI.keyUp(noteEvent);
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
        if (elem.type === vm.noteTypes.NOTE_OFF) {
          const matchingIndexes = bufferEvent
            .map((e, i) => (e.type === vm.noteTypes.NOTE_ON && e.midi === elem.midi && e.timestamp.seconds < elem.timestamp.seconds) ? i : -1)
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
        const noteOnEvent = cleanedEventBuffer.find(elem => elem.type === vm.noteTypes.NOTE_ON && elem.midi === midi);
        if (noteOnEvent) {
          // currentQuantizedEvents.push({
          //   type: "on",
          //   midi: midi,
          // })
          currentQuantizedEvents.push(noteOnEvent)
        }
        else {
          const noteHoldEvent = {
            type: vm.noteTypes.NOTE_HOLD,
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
      let onHoldEvents = currentQuantizedEvents.filter(elem => elem.type === vm.noteTypes.NOTE_ON || elem.type === vm.noteTypes.NOTE_HOLD);
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
    toggleMetronome() {
      // This method would update the status of metronome in Vuex Store.
      // this.$store.commit("muteMetronome");
      this.$store.commit("flipMetronomeStatus");
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
            type: this.noteTypes.NOTE_ON,
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

    hideSettingsModal() {
      this.$modal.hide("settingsModal");
    },

    transposeOctUp() {
      this.keyboardUIoctaveStart += 1;
      this.keyboardUIoctaveEnd += 1;
    },

    transposeOctDown() {
      this.keyboardUIoctaveStart -= 1;
      this.keyboardUIoctaveEnd -= 1;
    },

    number2RandomnessDescription(num) {
      return num / 1000;
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
  },
};
</script>'