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
        <div v-if="config.dataCollection" style="padding-bottom: 20px">
          <toggle-button color="#74601c" :value="true" @change="onPrivacyAgreeBtn($event)" />
          <span>
            Send us data of your interaction anonymously.</span>
        </div>
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
                        "></div>
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
                  <toggle-button color="#74601c" :value="true" @change="toggleMetronome"
                    style="transform: scale(0.9); padding-top: 17px" />
                </div>
              </div>
              <div class="md-layout-item md-small-size-50 md-xsmall-size-100">
                <div class="settingsDiv">
                  <p class="settingsOptionTitle">Your Piano Volume</p>
                  <p class="settingsValue">{{ userPianoVolume }}</p>
                  <vue-slider v-model="userPianoVolume" :lazy="true" :min="1" :max="10"
                    class="settingsSlider"></vue-slider>
                </div>
              </div>
              <div class="md-layout-item md-small-size-50 md-xsmall-size-100">
                <div class="settingsDiv">
                  <p class="settingsOptionTitle">Network Piano Volume</p>
                  <p class="settingsValue">{{ WorkerVolume }}</p>
                  <vue-slider v-model="WorkerVolume" :lazy="true" :min="1" :max="10" class="settingsSlider"></vue-slider>
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
                  <md-icon class="forceTextColor" >close</md-icon>
                  <span class="forceTextColor" >Reset Network</span>
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

// This is for Web Audio restrictions, we need to make an user behavior to trigger the Tone.start() function.
window.onclick = () => {
  Tone.start();
  Tone.context.lookAhead = 0;

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

      // metronomeStatus: true,
      lastNoteOnAi: "", //TODO: this is is used only by triggerWorkerSample
      reset: false, // reset signal to notify the AI worker to reset

      WebMIDISupport: false,
      pageLoadTime: null,
      modelLoadTime: null,
      activeDevices: [],
      selectedMIDIDevice: "",

      userPianoVolume: 10,
      WorkerVolume: 10,

      modelInferenceTimes: [], // used to calculate the average inference time and estimate maxBPM
      maxBPM: 0, // maxBPM supported by the current device

      isNotChrome: navigator.userAgent.indexOf("Chrome") <= -1,
      isMobile:
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
          navigator.userAgent
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
          navigator.userAgent.substr(0, 4)
        ),
      misalignErrCount: 0,
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

    /*
     * Loading Animation: set initial status of both div
     */
    this.$refs.mainContent.style.display = "none";
    this.$refs.entryBtn.style.visibility = "hidden";


    try {
      await fetch('/config.yaml')
      .then(response => response.text())
      .then(text => function () { 
        this.config = yaml.load(text);
        vm.$store.commit("setConfig", this.config); 
        vm.$store.commit("initQuantBuffers",this.config);
        vm.$store.commit("setTicksPerMeasure", this.config);
        this.BPM = this.config.tempo; 
      }.bind(this)());
      await fetch('/constants.json')
        .then(response => response.json())
        .then(json => function () { 
          this.messageType = json.messageType; 
          this.statusType = json.statusType;
        }.bind(this)());
      // console.log("config and constants loaded");
    } catch (err) {
      console.error(err);
    }

    vm.worker = new Worker("worker.js");
    vm.worker.onmessage = vm.workerCallback;
    await vm.worker.postMessage({
      messageType: vm.messageType.LOAD_CONFIG,
      content: vm.$store.getters.getConfig,
    });
    await vm.worker.postMessage({
      messageType: vm.messageType.LOAD_MODEL,
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
        "<p style='font-size:20px;line-height:35px;padding:40px;'>We are sorry, but BachDuet Web only support larger screens for now.<br />Please visit us on desktop or larger tablets.</p>";
    }

    /*
     * Initialize page load data collections
     */
    vm.userAgent = navigator.userAgent;
    vm.pageLoadTime =
      window.performance.timing.domContentLoadedEventEnd -
      window.performance.timing.navigationStart;
    vm.modelLoadTime = Date.now();

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
     */
    var keyboard = new AudioKeys({
      polyphony: 100, // set it to a very high number. We will handle the polyphony ourselves.
      rows: 2,
      priority: "last", // "last" applies only when polyphony is exceeded
      rootNote: 60,
    });

    // callback for when a laptop keyboard key is pressed
    keyboard.down(function (note) {
      let noteName = Midi.midiToNoteName(note.note, { sharps: true });
      // sound/sampler is active even when the improvisation (clock) has not started yet
      const midiEvent = {
          type: "noteOn",
          player : "human",
          note : noteName, //message.note.identifier,
          channel : 140, // this is channel midi channel 0
          midi : note.note,
          velocity : 127,
          timestamp : Tone.now(),
        }
      let delay = 0;
      vm.$store.dispatch("samplerOn", { midiEvent, delay });
      if (vm.$store.getters.getClockStatus) {
        vm.$root.$refs.pianoRollUI.keyDown(midiEvent);
        vm.$store.dispatch("noteOn", midiEvent);
      }
    });

    // callback for when a laptop keyboard key is released
    keyboard.up(function (note) {
      let noteName = Midi.midiToNoteName(note.note, { sharps: true });

      const midiEvent = {
        type: "noteOff",
        player: "human",
        note: noteName, //message.note.identifier,
        channel: 140, // this is channel midi channel 0
        midi: note.note,
        velocity: 127,
        timestamp: Tone.now(),
      }
      let delay = 0;
      vm.$store.dispatch("samplerOff", { midiEvent, delay });
      if (vm.$store.getters.getClockStatus) {
        // this enters here, only when the clock has started
        vm.$root.$refs.pianoRollUI.keyUp(midiEvent);
        vm.$store.dispatch("noteOff", midiEvent);
      }
    });
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
    WorkerVolume: {
      immediate: true,
      handler(newValue) {
        this.$store.commit("setWorkerVolume", newValue);
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
          type: "noteOn",
          player: "human",
          note: message.note.identifier,
          channel: message.data[0],
          midi: message.data[1],
          velocity: message.data[2],
          timestamp: message.timestamp,
        }
        let delay = 0;
        this.$store.dispatch("samplerOn", { midiEvent, delay });
        if (this.$store.getters.getClockStatus) {
          this.$root.$refs.pianoRollUI.keyDown(midiEvent);
          this.$store.dispatch("noteOn", midiEvent);
        }
      });

      inputDevice.addListener("noteoff", (message) => {
        const midiEvent = {
          type: "noteOff",
          player: "human",
          note: message.note.identifier,
          channel: message.data[0],
          midi: message.data[1],
          velocity: message.data[2],
          timestamp: message.timestamp,
        }
        let delay = 0;
        this.$store.dispatch("samplerOff", { midiEvent, delay });
        if (this.$store.getters.getClockStatus) {
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
      console.log("INSIDE runTheWorker");
      const vm = this;
      // For both GRID and CONTINUOUS modes, we also quantize the user input to the clock grid
      // it's up to the worker to use it if it wants to.
      this.estimateHumanQuantizedNote();


      // remember, runTheWorker happens with a small delay of tick/4 after the tick
      // here I just keep track of the 'delayed' tick
      this.$store.commit("incrementTickDelayed");

      // MAJOR TODO : draw should probably go before the delayedTickIncrement
      this.$root.$refs.scoreUI.draw();

      this.worker.postMessage({
        messageType: vm.messageType.INFERENCE,
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
      // If the worker is giving us only string
      // if (typeof e.data === "string" || e.data instanceof String)
      if (e.data.messageType === vm.messageType.INFERENCE) {
        // If the worker is giving us a prediction (inference)
        const workerPrediction = e.data.message;
        vm.modelInferenceTimes.push(workerPrediction.predictTime);
        

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

        this.$store.dispatch("storeWorkerQuantizedOutput", workerPrediction);

        this.reset = false; // for explanation see the comment about reset inside runTheWorker()
      }
      else if (e.data.messageType === vm.messageType.STATUS) {
        if (e.data.statusType == vm.statusType.SUCCESS) {
          vm.$refs.entryBtn.classList.add("fade-in");
          vm.$refs.entryBtn.style.visibility = "visible";
          vm.modelLoadTime = Date.now() - vm.modelLoadTime;
        }
        const workerStatus = vm.$refs.workerStatus;
        workerStatus.innerHTML = e.data.message;
      }

    },

    resetNetwork() {
      this.reset = true;
    },

    triggerWorkerSampler() {
      // here, we check the note the AI predicted in the previous tick,
      // for the tick we are now. If the articulation of the predicted note
      // is 1 (hit), then we trigger the AI sampler to play the note.
      // if there is already a note active, we have to triggerRelease first
      // if the predicted note is a rest ... blablabla.

      // TODO : for Euterpe/polyphony, if the number of active notes exceeds te polyphony limit (set by the developer)
      // then we have to triggerRelease the oldest note first. which means we need to keep track of the order of the notes

      // TODO : fix the payloads
      // TODO : A worker that supports polyphony should be able to send note off events also. 
      const workerPrediction = this.$store.getters.getWorkerPredictionFor(
        this.$store.getters.getLocalTick
      );
      console.log("workerPrediction", workerPrediction);
      if (workerPrediction.articulation == 1) {
        if (workerPrediction.midi != 0) {
          if (!(this.lastNoteOnAi === "")) {
            const midiEvent = {
              player: "worker",
              note: this.lastNoteOnAi,
              // channel : message.data[0],
              // midi : message.data[1],
              // velocity : message.data[2],
              timestamp: Tone.now(),
            }
            const delay = 0;
            this.$store.dispatch("samplerOff", { midiEvent, delay });

            this.$root.$refs.pianoRollUI.keyUp(midiEvent);
          }
          const currentNote = Midi.midiToNoteName(workerPrediction.midi, {
            sharps: true,
          });
          const midiEvent = {
            player: "worker",
            note: currentNote,
            timestamp: Tone.now(),
          }
          const delay = 0;
          this.$store.dispatch("samplerOn", { midiEvent, delay });
          this.$root.$refs.pianoRollUI.keyDown(midiEvent);
          this.lastNoteOnAi = currentNote;
        } else {
          if (!(this.lastNoteOnAi === "")) {
            const midiEvent = {
              player: "worker",
              note: this.lastNoteOnAi,
              timestamp: Tone.now(),
            };
            let delay = 0;
            this.$store.dispatch("samplerOff", { midiEvent, delay });
            this.$root.$refs.pianoRollUI.keyUp(midiEvent);
            this.lastNoteOnAi = ""; // TODO I don't like that. 
          }
        }
      }
    },

    
    estimateHumanQuantizedNote() {
      /* TODO:
      everything written here is based on BachDuet specifically.
      The whole purpose is to estimate the quantized input and send it to vuex dispatch("storeHumanQuantizedInput")

      Currently only one monophonic quantization is supported. This needs to change. Let's see
      For monophony, I get the active notes (this is polyphonic)
      and the last note on event (this is monophonic)

      I found it
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
        if (elem.type === "noteOff") {
          const matchingIndexes = bufferEvent
                .map((e, i) => (e.type === "noteOn" && e.midi === elem.midi && e.timestamp < elem.timestamp) ? i : -1)
                .filter(index => index !== -1);
          if (matchingIndexes.length > 0){
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
        const noteOnEvent = cleanedEventBuffer.find(elem => elem.type === "noteOn" && elem.midi === midi);
        if (noteOnEvent) {
          currentQuantizedEvents.push({
            type: "on",
            midi: midi,
          })
        }
        else {
          currentQuantizedEvents.push({
            type: "hold",
            midi: midi,
          })
        }
      }
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
      
      // FOR NOW WE DON"T INCLUDE NOTE_OFF EVENTS IN THE QUANTIZED DATA.
      let constrainedCurrentQuantizedEvents = [];
      const polyphony = 2;
      let onHoldEvents = currentQuantizedEvents.filter(elem => elem.type === "on" || elem.type === "hold");
      // let offEvents = currentQuantizedEvents.filter(elem => elem.type === "off");
      if (onHoldEvents.length > polyphony) {
        // let onHoldEventsToRemove = onHoldEvents.slice(polyphony);
        let onHoldEventsToKeep = onHoldEvents.slice(0, polyphony);
        // let offEventsToAdd = onHoldEventsToRemove.map(elem => {
        //   return {
        //     type: "off",
        //     midi: elem.midi,
        //   }
        // })
        constrainedCurrentQuantizedEvents = [...onHoldEventsToKeep];//, ...offEventsToAdd, ...offEvents];
      }
      else{
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
            
            vm.triggerWorkerSampler();
            
            
            // run the worker with a small delay of tick/4 in order to include 
            // any notes that the user played very close to the tick change.
            // this makes the grid a bit more flexible, and the human input is correctly parsed
            // In terms of playability, the human finds it much more easy to play along the metronome on the grid
            setTimeout(function () {
              vm.runTheWorker();
            }, parseInt(vm.$store.getters.getClockPeriod / 4));
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
      this.$store.commit("muteMetronome");
      this.$store.commit("flipMetronomeStatus");
    },
    metronomeTrigger() {
      // This method would trigger the metronome sampler.
      if (
        // getTicksPerBeat returns the number of ticks per beat
        // and we want the metronome to trigger every beat
        this.$store.getters.getLocalTick % this.$store.getters.getTicksPerBeat ==
        0
      ) {
        var currentNote =
          this.$store.getters.getLocalTick % this.$store.getters.getTicksPerMeasure === 0 ? "G0" : "C0";
        const midiEvent = {
          player: "metronome",
          note: currentNote,
          timestamp: Tone.now(),
        };
        let delay = 0;
        this.$store.dispatch("samplerOn", { midiEvent, delay });
        this.calculateMaxBPM();
      }
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
      vm.maxBPM = Math.round(1000* 60 / dt / vm.$store.getters.getTicksPerBeat);
      console.log("maxBPM", vm.maxBPM);
    },
  },
};
</script>