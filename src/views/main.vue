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
      <AudioMeter ref="audioMeter" :width="300" :height="100" :fft_bins="128" orientation="top"
        style="position:absolute; z-index:0; top:0; left:400; background-color:transparent" />
      <ChromaChart ref="chromaChart" :width="300" :height="100"
        :styles="{ position: 'absolute', zIndex: 0, top: '100px', left: '0px', backgroundColor: 'transparent' }" />
      <PianoRoll style="position:absolute; z-index:-1; top:0; left:0" />
      <Keyboard id="pianoKeyboard" class="pianoKeyboard" ref="keyboard" :key="keyboardKey"
        :octave-start="keyboardoctaveStart" :octave-end="keyboardoctaveEnd" />
      <!-- On-screen buttons -->
      <div style="position: absolute; bottom: 230px; right: 20px">
        <md-button class="controlBtn" @click="toggleClock" style="width: 40px">
          <div v-if="localSyncClockStatus">
            <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd"
                d="M9 7C9 6.44772 8.55228 6 8 6C7.44772 6 7 6.44772 7 7V17C7 17.5523 7.44772 18 8 18C8.55228 18 9 17.5523 9 17V7ZM17 7C17 6.44772 16.5523 6 16 6C15.4477 6 15 6.44772 15 7V17C15 17.5523 15.4477 18 16 18C16.5523 18 17 17.5523 17 17V7Z"
                fill="#000000" />
            </svg>
          </div>
          <div v-else="localSyncClockStatus">
            <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path id="Vector"
                d="M5 17.3336V6.66698C5 5.78742 5 5.34715 5.18509 5.08691C5.34664 4.85977 5.59564 4.71064 5.87207 4.67499C6.18868 4.63415 6.57701 4.84126 7.35254 5.25487L17.3525 10.5882L17.3562 10.5898C18.2132 11.0469 18.642 11.2756 18.7826 11.5803C18.9053 11.8462 18.9053 12.1531 18.7826 12.4189C18.6418 12.7241 18.212 12.9537 17.3525 13.4121L7.35254 18.7454C6.57645 19.1593 6.1888 19.3657 5.87207 19.3248C5.59564 19.2891 5.34664 19.1401 5.18509 18.9129C5 18.6527 5 18.2132 5 17.3336Z"
                stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <!-- <md-icon>{{ localSyncClockStatus ? "pause" : "play_arrow" }}</md-icon> -->
          <!-- <span> {{ localSyncClockStatus ? "Pause" : "Play" }}</span> -->
        </md-button>
        <md-button class="controlBtn" @click="showSettingsModal">
          <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M6.07194 6.26794L6.57194 5.40192L6.07194 6.26794ZM4.70592 6.63397L3.83989 6.13397L3.83989 6.13397L4.70592 6.63397ZM3.70592 8.36602L2.83989 7.86602H2.83989L3.70592 8.36602ZM4.07194 9.73205L3.57194 10.5981H3.57194L4.07194 9.73205ZM4.07194 14.2679L3.57194 13.4019H3.57194L4.07194 14.2679ZM3.70592 15.634L4.57194 15.134H4.57194L3.70592 15.634ZM4.70592 17.366L3.83989 17.866H3.83989L4.70592 17.366ZM6.07194 17.732L6.57194 18.5981L6.07194 17.732ZM17.9284 17.732L17.4283 18.5981L17.4284 18.5981L17.9284 17.732ZM19.2944 17.366L18.4284 16.866L19.2944 17.366ZM20.2944 15.634L21.1604 16.134L20.2944 15.634ZM19.9284 14.2679L19.4284 15.134V15.134L19.9284 14.2679ZM19.9284 9.73205L20.4284 10.5981V10.5981L19.9284 9.73205ZM20.2944 8.36602L19.4284 8.86602L19.4284 8.86602L20.2944 8.36602ZM19.2944 6.63397L18.4284 7.13397L19.2944 6.63397ZM17.9284 6.26794L18.4284 7.13397L17.9284 6.26794ZM14.6514 6.61604L14.2089 7.51283L14.6514 6.61604ZM16.5119 7.08573L17.0119 7.95175L16.5119 7.08573ZM15.336 7.01204L14.7793 7.84277L15.336 7.01204ZM17.9873 11.6035L16.9894 11.6686L17.9873 11.6035ZM18.5118 10.5499L18.0118 9.68388L18.5118 10.5499ZM15.336 16.988L14.7793 16.1572L15.336 16.988ZM16.5119 16.9143L16.0119 17.7803L16.5119 16.9143ZM18.5118 13.4501L18.0118 14.3161L18.5118 13.4501ZM9.34892 17.384L9.79137 16.4872L9.34892 17.384ZM7.48838 16.9143L6.98838 16.0482L7.48838 16.9143ZM8.6643 16.988L8.10763 17.8187L8.6643 16.988ZM14.6514 17.384L15.0938 18.2808L14.6514 17.384ZM5.48852 10.5499L4.98852 11.4159L5.48852 10.5499ZM6.01304 11.6035L5.01516 11.5385L6.01304 11.6035ZM7.48839 7.08573L6.98839 7.95176L7.48839 7.08573ZM11.0001 4V4V2C9.89558 2 9.00015 2.89543 9.00015 4H11.0001ZM11.0001 5.63424V4H9.00015V5.63424H11.0001ZM9.22099 7.84277C9.40312 7.72073 9.59361 7.6104 9.79137 7.51283L8.90647 5.71924C8.62922 5.85603 8.36245 6.01056 8.10764 6.18131L9.22099 7.84277ZM5.57194 7.13397L6.98839 7.95176L7.98839 6.2197L6.57194 5.40192L5.57194 7.13397ZM5.57194 7.13397L6.57194 5.40192C5.61536 4.84963 4.39218 5.17738 3.83989 6.13397L5.57194 7.13397ZM4.57194 8.86602L5.57194 7.13397L3.83989 6.13397L2.83989 7.86602L4.57194 8.86602ZM4.57194 8.86602L4.57194 8.86602L2.83989 7.86602C2.28761 8.82261 2.61536 10.0458 3.57194 10.5981L4.57194 8.86602ZM5.98852 9.68388L4.57194 8.86602L3.57194 10.5981L4.98852 11.4159L5.98852 9.68388ZM7.00015 12C7.00015 11.8885 7.00378 11.778 7.01092 11.6686L5.01516 11.5385C5.0052 11.6912 5.00015 11.8451 5.00015 12H7.00015ZM7.01092 12.3314C7.00378 12.222 7.00015 12.1115 7.00015 12H5.00015C5.00015 12.1549 5.0052 12.3088 5.01516 12.4615L7.01092 12.3314ZM4.57194 15.134L5.98852 14.3161L4.98852 12.5841L3.57194 13.4019L4.57194 15.134ZM4.57194 15.134L4.57194 15.134L3.57194 13.4019C2.61536 13.9542 2.28761 15.1774 2.83989 16.134L4.57194 15.134ZM5.57194 16.866L4.57194 15.134L2.83989 16.134L3.83989 17.866L5.57194 16.866ZM5.57194 16.866L5.57194 16.866L3.83989 17.866C4.39218 18.8226 5.61536 19.1504 6.57194 18.5981L5.57194 16.866ZM6.98838 16.0482L5.57194 16.866L6.57194 18.5981L7.98838 17.7803L6.98838 16.0482ZM9.79137 16.4872C9.59361 16.3896 9.40312 16.2793 9.22098 16.1572L8.10763 17.8187C8.36245 17.9894 8.62922 18.144 8.90647 18.2808L9.79137 16.4872ZM11.0001 20V18.3658H9.00015V20H11.0001ZM11.0001 20H9.00015C9.00015 21.1046 9.89558 22 11.0001 22V20ZM13.0001 20H11.0001V22H13.0001V20ZM13.0001 20V22C14.1047 22 15.0001 21.1046 15.0001 20H13.0001ZM13.0001 18.3658V20H15.0001V18.3658H13.0001ZM14.7793 16.1572C14.5972 16.2793 14.4067 16.3896 14.2089 16.4872L15.0938 18.2808C15.3711 18.144 15.6378 17.9894 15.8927 17.8187L14.7793 16.1572ZM18.4284 16.866L17.0119 16.0482L16.0119 17.7803L17.4283 18.5981L18.4284 16.866ZM18.4284 16.866H18.4283L17.4284 18.5981C18.3849 19.1504 19.6081 18.8226 20.1604 17.866L18.4284 16.866ZM19.4284 15.134L18.4284 16.866L20.1604 17.866L21.1604 16.134L19.4284 15.134ZM19.4284 15.134V15.134L21.1604 16.134C21.7127 15.1774 21.3849 13.9542 20.4284 13.4019L19.4284 15.134ZM18.0118 14.3161L19.4284 15.134L20.4284 13.4019L19.0118 12.5841L18.0118 14.3161ZM17.0001 12C17.0001 12.1115 16.9965 12.222 16.9894 12.3314L18.9851 12.4615C18.9951 12.3088 19.0001 12.1549 19.0001 12H17.0001ZM16.9894 11.6686C16.9965 11.778 17.0001 11.8885 17.0001 12H19.0001C19.0001 11.8451 18.9951 11.6912 18.9851 11.5385L16.9894 11.6686ZM19.4284 8.86602L18.0118 9.68388L19.0118 11.4159L20.4284 10.5981L19.4284 8.86602ZM19.4284 8.86602L19.4284 8.86602L20.4284 10.5981C21.3849 10.0458 21.7127 8.82261 21.1604 7.86602L19.4284 8.86602ZM18.4284 7.13397L19.4284 8.86602L21.1604 7.86602L20.1604 6.13397L18.4284 7.13397ZM18.4284 7.13397V7.13397L20.1604 6.13397C19.6081 5.17738 18.3849 4.84963 17.4284 5.40192L18.4284 7.13397ZM17.0119 7.95175L18.4284 7.13397L17.4284 5.40192L16.0119 6.2197L17.0119 7.95175ZM14.2089 7.51283C14.4067 7.6104 14.5972 7.72072 14.7793 7.84277L15.8927 6.18131C15.6378 6.01056 15.3711 5.85603 15.0938 5.71924L14.2089 7.51283ZM13.0001 4V5.63423H15.0001V4H13.0001ZM13.0001 4H15.0001C15.0001 2.89543 14.1047 2 13.0001 2V4ZM11.0001 4H13.0001V2H11.0001V4ZM15.0938 5.71924C15.0511 5.69815 15.0232 5.67053 15.0094 5.65025C14.9972 5.63248 15.0001 5.62788 15.0001 5.63423H13.0001C13.0001 6.50299 13.5491 7.18731 14.2089 7.51283L15.0938 5.71924ZM16.0119 6.2197C16.0174 6.21655 16.0149 6.22132 15.9937 6.21972C15.9694 6.21789 15.9319 6.20762 15.8927 6.18131L14.7793 7.84277C15.3915 8.25303 16.2594 8.38623 17.0119 7.95175L16.0119 6.2197ZM18.9851 11.5385C18.9821 11.4913 18.992 11.4537 19.0025 11.4318C19.0118 11.4126 19.0172 11.4128 19.0118 11.4159L18.0118 9.68388C17.2604 10.1177 16.9415 10.9342 16.9894 11.6686L18.9851 11.5385ZM15.8927 17.8187C15.9319 17.7924 15.9694 17.7821 15.9937 17.7803C16.0149 17.7787 16.0174 17.7834 16.0119 17.7803L17.0119 16.0482C16.2594 15.6138 15.3915 15.747 14.7793 16.1572L15.8927 17.8187ZM19.0118 12.5841C19.0172 12.5872 19.0118 12.5874 19.0025 12.5682C18.992 12.5462 18.9821 12.5087 18.9851 12.4615L16.9894 12.3314C16.9415 13.0658 17.2604 13.8823 18.0118 14.3161L19.0118 12.5841ZM8.90647 18.2808C8.94923 18.3019 8.97711 18.3295 8.99094 18.3497C9.00306 18.3675 9.00015 18.3721 9.00015 18.3658H11.0001C11.0001 17.497 10.4512 16.8127 9.79137 16.4872L8.90647 18.2808ZM7.98838 17.7803C7.98292 17.7834 7.98539 17.7787 8.00661 17.7803C8.03085 17.7821 8.06836 17.7924 8.10763 17.8187L9.22098 16.1572C8.60875 15.747 7.74092 15.6138 6.98838 16.0482L7.98838 17.7803ZM15.0001 18.3658C15.0001 18.3721 14.9972 18.3675 15.0094 18.3497C15.0232 18.3295 15.0511 18.3019 15.0938 18.2808L14.2089 16.4872C13.5491 16.8127 13.0001 17.497 13.0001 18.3658H15.0001ZM5.01516 12.4615C5.01823 12.5086 5.00833 12.5462 4.99777 12.5682C4.98851 12.5874 4.9831 12.5872 4.98852 12.5841L5.98852 14.3161C6.73991 13.8823 7.05882 13.0658 7.01092 12.3314L5.01516 12.4615ZM4.98852 11.4159C4.9831 11.4128 4.98851 11.4126 4.99777 11.4318C5.00833 11.4537 5.01823 11.4913 5.01516 11.5385L7.01092 11.6686C7.05882 10.9342 6.73991 10.1177 5.98852 9.68388L4.98852 11.4159ZM8.10764 6.18131C8.06837 6.20763 8.03085 6.21789 8.00662 6.21972C7.9854 6.22133 7.98293 6.21655 7.98839 6.2197L6.98839 7.95176C7.74092 8.38623 8.60876 8.25303 9.22099 7.84277L8.10764 6.18131ZM9.00015 5.63424C9.00015 5.62788 9.00306 5.63248 8.99094 5.65025C8.97711 5.67053 8.94923 5.69815 8.90647 5.71924L9.79137 7.51283C10.4512 7.18731 11.0001 6.50299 11.0001 5.63424H9.00015Z"
              fill="#000000" />
            <circle cx="12" cy="12" r="3" stroke="#000000" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
          <!-- <span> Settings </span> -->
        </md-button>
        <md-button class="controlBtn" @click="showMixerModal">
          <svg fill="#000000" width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 13.829A3.004 3.004 0 0 0 11 11a3.003 3.003 0 0 0-2-2.829V0H7v8.171A3.004 3.004 0 0 0 5 11c0 1.306.836 2.417 2 2.829V16h2v-2.171zm-5-6A3.004 3.004 0 0 0 6 5a3.003 3.003 0 0 0-2-2.829V0H2v2.171A3.004 3.004 0 0 0 0 5c0 1.306.836 2.417 2 2.829V16h2V7.829zm10 0A3.004 3.004 0 0 0 16 5a3.003 3.003 0 0 0-2-2.829V0h-2v2.171A3.004 3.004 0 0 0 10 5c0 1.306.836 2.417 2 2.829V16h2V7.829zM12 6V4h2v2h-2zM2 6V4h2v2H2zm5 6v-2h2v2H7z"
              fill-rule="evenodd" />
          </svg>
          <!-- <span> Settings </span> -->
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
            <p class="settingsSubtitle">Worker</p>
            <div class="md-layout md-gutter md-alignment-center">

              <VerticalSlider v-model="slider1" :min="1" :max="100" label="Slider 1" />
              <VerticalSlider v-model="slider2" :min="1" :max="100" label="Slider 2" />
              <VerticalSlider v-model="slider3" :min="1" :max="100" label="Slider 3" />
              <VerticalSlider v-model="slider4" :min="1" :max="100" label="Slider 4" />
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
            <div class="md-layout md-gutter md-alignment-left">
              <div style="height:60px;padding-left:12px; padding-top:10px; min-width:200px;">
                <p style="height:15px;margin:0;line-height:0;">Total Volume</p>
                <p style="height:35px;margin:0;line-height:15px;font-size:20px;font-weight:800">{{ humanVolume * 10 }} % </p>
              </div>
              <HorizontalSlider v-model="humanVolume" :min="1" :max="10" />
              <p>Mute</p>
              <toggle-button color="#74601c" v-model="humanSamplerMuted" @change="toggleHumanSamplers"
                style="transform: scale(0.9); padding-top: 17px" />
            </div>

            <div class="md-layout md-gutter md-alignment-left">
              <div style="height:60px;padding-left:12px; padding-top:10px; min-width:200px;">
                <p style="height:15px;margin:0;line-height:0;">Upright Bass Volume</p>
                <p style="height:35px;margin:0;line-height:15px;font-size:20px;font-weight:800">{{ humanUprightBassVolume * 10 }} % </p>
              </div>
              <HorizontalSlider v-model="humanUprightBassVolume" :min="1" :max="10" />
              <p>Mute</p>
              <toggle-button color="#74601c" :value="humanUprightBassMuted" @change="togglehumanUprightBass"
                style="transform: scale(0.9); padding-top: 17px" />
            </div>

            <p class="settingsSubtitle">Metronome</p>
            <div class="md-layout md-gutter md-alignment-left">
              <div style="height:60px;padding-left:12px; padding-top:10px; min-width:200px;">
                <p style="height:15px;margin:0;line-height:0;">Metronome Volume</p>
                <p style="height:35px;margin:0;line-height:15px;font-size:20px;font-weight:800">{{ metronomeVolume * 10 }} % </p>
              </div>
              <HorizontalSlider v-model="metronomeVolume" :min="1" :max="10" />
              <p>Mute</p>
              <toggle-button color="#74601c" :value="false" @change="toggleMetronome"
                style="transform: scale(0.9); padding-top: 17px" />
            </div>

            <p class="settingsSubtitle">Worker</p>
            <div class="md-layout md-gutter md-alignment-left">
              <div style="height:60px;padding-left:12px; padding-top:10px; min-width:200px;">
                <p style="height:15px;margin:0;line-height:0;">Worker Total Volume</p>
                <p style="height:35px;margin:0;line-height:15px;font-size:20px;font-weight:800">{{ workerVolume * 10 }} % </p>
              </div>
              <HorizontalSlider v-model="workerVolume" :min="1" :max="10" />
              <p>Mute</p>
              <toggle-button color="#74601c" :value="false" @change="toggleWorkerSamplers"
                style="transform: scale(0.9); padding-top: 17px" />
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
import { WebMidi } from "webmidi";
import Dropdown from "vue-simple-search-dropdown";
import AudioKeys from "audiokeys";
import yaml from "js-yaml";
import * as rb from "ringbuf.js"; // /dist/index.js
import { messageType, statusType, noteType, uiParameterType, workerParameterType } from '@/utils/types.js'
import { URLFromFiles, isMobile, isNotChrome } from '@/utils/helpers.js'

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


      workerParameterInterval: null,
      // reset signal to notify the Worker to reset.
      // If your worker doesn't support reseting, you can ignore this.
      reset: false,

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

      sliderValue: 0,
      slider1: 0,
      slider2: 0,
      slider3: 0,
      slider4: 0,

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
    // vm.recorderWorkSletNode.connect(vm.audioContext.destination);
    // vm.workerPlayer = new Tone.Player().toDestination();

    // vm.osc = new OscillatorNode(vm.audioContext);
    // var fm = new OscillatorNode(vm.audioContext);
    // var gain = new GainNode(vm.audioContext);
    // var panner = new StereoPannerNode(vm.audioContext);
    // var panModulation = new OscillatorNode(vm.audioContext);

    // panModulation.frequency.value = 2.0;
    // fm.frequency.value = 1.0;
    // gain.gain.value = 110;

    // panModulation.connect(panner.pan);
    // fm.connect(gain).connect(vm.osc.frequency);
    // vm.osc.connect(panner).connect(vm.audioContext.destination);
    // // panner.connect(vm.recorderWorkletNode);

    // vm.osc.start(0);
    // fm.start(0);
    // panModulation.start(0);

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
    slider1: {
      immediate: true,
      handler(newValue) {
        console.log("paramWriter " + this.paramWriter + " type" + this.uiParameterType.SLIDER_1);
        if (this.paramWriter != null &&
          !this.paramWriter.enqueue_change(this.uiParameterType.SLIDER_1, newValue)) {
          console.error("Couldn't enqueue.");
        }
      },
    },
    slider2: {
      immediate: true,
      handler(newValue) {
        if (this.paramWriter != null &&
          !this.paramWriter.enqueue_change(this.uiParameterType.SLIDER_2, newValue)) {
          console.error("Couldn't enqueue.");
        }
      },
    },
    slider3: {
      immediate: true,
      handler(newValue) {
        if (this.paramWriter != null &&
          !this.paramWriter.enqueue_change(this.uiParameterType.SLIDER_3, newValue)) {
          console.error("Couldn't enqueue.");
        }
      },
    },
    slider4: {
      immediate: true,
      handler(newValue) {
        if (this.paramWriter != null &&
          !this.paramWriter.enqueue_change(this.uiParameterType.SLIDER_4, newValue)) {
          console.error("Couldn't enqueue.");
        }
      },
    },
    // randomness: {
    //   immediate: true,
    //   handler(newValue) {
    //     if (this.paramWriter!=null && !this.paramWriter.enqueue_change(0, newValue)) {
    //       console.error("Couldn't enqueue.");
    //     }
    //     console.log("inside randomness handler")
    //     // this.$store.commit("setRandomness", newValue / 1000);
    //   },
    // },
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
    sliderValue: {
      immediate: true,
      handler(newValue) {
        console.log("sliderValue changed to: " + newValue);
      },
    },
  },

  methods: {

    workerParameterObserver() {
      let newParameterWorker = { index: null, value: null };
      if (this.paramReader.dequeue_change(newParameterWorker)) {
        // console.log("param index: " + newParameterWorker.index + " value: " + newParameterWorker.value);
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
        messageType: vm.messageType.EVENTS_BUFFER,
        content: {
          tick: this.$store.getters.getLocalTick,
          humanQuantizedInput: this.$store.getters.getHumanInputFor(this.$store.getters.getLocalTick),
          humanContinuousBuffer: this.$store.getters.getMidiEventBuffer,
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
  },
};
</script>'