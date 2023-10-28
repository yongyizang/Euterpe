<!--
    This is the vue component of pianoRoll, a musical game style interface for interaction.

    This component is inspired by and referenced based on AI Duet's implementation of the same feature
    with some significant changes to the code.
-->
<template>
  <div>
    <div ref="canvas"></div>
  </div>
</template>
<script>
// This project mainly uses Three.js to generate the canvas.
import * as THREE from 'three';
import {Midi} from '@tonaljs/tonal';
import {
	  playerType, instrumentType, eventSourceType,
  messageType, statusType, noteType,
  uiParameterType,
  agentHookType,
} from '@/utils/types.js';

import('../css/variables.css');

// get --pianoRoll-human-color and --pianoRoll-agent-color from CSS.
const colorForAgent = getComputedStyle(document.documentElement).getPropertyValue(
    '--pianoRoll-agent-color',
);
const colorForHuman = getComputedStyle(document.documentElement).getPropertyValue(
    '--pianoRoll-human-color',
);

const initialScaling = 10000; // a constant in scaling the noteblock.
const keyboardHeight = 210;
const NoteAnimationMargin = 10; // margin of noteblock plane compared to the width of the key.

// Define basic "humanMaterial" for three.js to build note blocks.
const geometry = new THREE.PlaneGeometry(1, 1, 1); // A basic plane.
const humanMaterial = new THREE.MeshBasicMaterial({
  color: colorForHuman,
  side: THREE.DoubleSide,
});
const agentMaterial = new THREE.MeshBasicMaterial({
  color: colorForAgent,
  side: THREE.DoubleSide,
});

export default {
  name: 'PianoRoll',
  data() {
    return {
      lastUpdateTime: 0,
      /*
        We use lastUpdateTime to log the time traveled beturn frame generations
        to determine how far the note block should 'rise' in the page.

        See the method animate().
      */
      currentNotes: {},
      /*
        We don't actually note anything here.

        This is mainly just a flag... We use this to track the noteblocks generated.
        See the method KeyDown() for how this data is used.
      */
      // The rest here are basically just parameters Three.js need.
      renderer: null,
      scene: null,
      camera: null,
    };
  },

  created() {
    // Here's a trick to 'broadcast' the methods here to all components
    // so they could do this:
    // this.$root.$refs.pianoRoll.keyDown(currentNote, true);
    // See keyDown() and keyUp() method for more details here.
    this.$root.$refs.pianoRoll = this;
  },

  mounted() {
    // this.geometry = new THREE.PlaneGeometry(1, 1, 1); // A basic plane.
    // this.humanMaterial = new THREE.MeshBasicMaterial({
    //     color: 'red',
    //     side: THREE.DoubleSide,
    // });
    // Just calls all methods that we need.
    this.init();
    this.animate();
    this.resize();
    // setTimeout(this.keyDownDummy, 3000);
  },

  methods: {
    init() {
      // Initialize the scene, camera and renderer.
      this.scene = new THREE.Scene();
      this.camera = new THREE.OrthographicCamera(0, 1, 1, 0, 1, 1000);
      this.camera.position.z = 1;
      this.camera.lookAt(new THREE.Vector3(0, 0, 0));
      this.renderer = new THREE.WebGLRenderer({alpha: true});
      this.renderer.setSize(window.innerWidth, window.innerHeight);

      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setClearColor(0xffffff, 0);
      this.renderer.sortObjects = false;
      this.$refs.canvas.appendChild(this.renderer.domElement);
      console.log('size of canvas is ', this.$refs.canvas.clientWidth, this.$refs.canvas.clientHeight);
      console.log('size of window is ', window.innerWidth, window.innerHeight);
      // console.log("size of renderer is ", this.renderer.getSize);
    },

    resize() {
      // Every time we need to resize, this method takes care of that.
      this.camera.left = 0;
      this.camera.right = this.$refs.canvas.clientWidth;
      this.camera.top = 0;
      this.camera.bottom = this.$refs.canvas.clientHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(
          this.$refs.canvas.clientWidth,
          this.$refs.canvas.clientHeight - keyboardHeight,
      );
    },

    animate() {
      // Update lastUpdate time and compute the time difference since last update.
      const delta = Date.now() - this.lastUpdateTime;
      this.lastUpdateTime = Date.now();
      // Tell three.js to give us another frame!
      requestAnimationFrame(this.animate);
      if (this.$store.getters.getClockStatus) {
        // Update camera position.
        // Camera moves down to give the illusion that every noteblock goes up.
        this.camera.position.y += (1 / 10) * delta * 3;
      }
      // Tell renderer to re-render.
      this.renderer.render(this.scene, this.camera);
    },

    keyDown(noteEvent) {
      let noteInput = noteEvent.name;
      if (noteInput == null) {
        noteInput = Midi.midiToNoteName(noteEvent.midi, {sharps: true});
      }
      // console.log("player", noteEvent.player, "sent keyDown note ", noteInput, noteEvent.type, noteEvent.midi);
      if (this.$store.getters.getClockStatus) {
        // TODO pianoRoll should be based on Midi number.
        if (document.getElementsByClassName(noteInput.replace('#', 's'))[0]) {
          const notePosition = document
              .getElementsByClassName(noteInput.replace('#', 's'))[0]
              .getBoundingClientRect();

          // Define the noteblock plane.
          const plane = new THREE.Mesh(geometry, (noteEvent.player == playerType.AGENT) ? agentMaterial : humanMaterial);
          const noteWidth =
            notePosition.right - notePosition.left - NoteAnimationMargin * 2;
          plane.scale.set(noteWidth, initialScaling, 1);

          // Define the plane's position.
          plane.position.x =
            notePosition.left + noteWidth / 2 + NoteAnimationMargin;
          plane.position.y =
            window.innerHeight + this.camera.position.y + initialScaling / 2;
          plane.position.z = 0;

          // Add that plane to the scene.
          this.scene.add(plane);

          // Register this noteblock to the currentNotes data.
          const selector = (noteEvent.player == playerType.AGENT) ? playerType.AGENT + noteInput : playerType.HUMAN + noteInput;
          if (!this.currentNotes.hasOwnProperty(selector)) {
            this.currentNotes[selector] = [];
          }
          this.currentNotes[selector].push({
            plane: plane,
            position: this.camera.position.y,
          });
        }
      }
    },

    keyUp(noteEvent) {
      let noteInput = noteEvent.name;
      if (noteInput == null) {
        noteInput = Midi.midiToNoteName(noteEvent.midi, {sharps: true});
      }
      // console.log("player", noteEvent.player, "sent keyUp note ", noteInput, noteEvent.type, noteEvent.midi);
      const selector = (noteEvent.player == playerType.AGENT) ? playerType.AGENT + noteInput : playerType.HUMAN + noteInput;
      // If there is the noteblock we are looking for:
      if (this.currentNotes[selector] && this.currentNotes[selector].length) {
        const note = this.currentNotes[selector].shift();
        // Change its scale and position.
        note.plane.scale.y = Math.max(
            this.camera.position.y - note.position,
            5,
        );
        note.plane.position.y =
          this.$refs.canvas.clientHeight +
          keyboardHeight +
          note.position +
          note.plane.scale.y / 2;
      }
    },
    keyDownDummy() {
      console.log('keyDown\n\n\n\n\n\n\n\n\n');
      // Define the noteblock plane.
      const plane = new THREE.Mesh(geometry, humanMaterial);
      const noteWidth = 30;
      plane.scale.set(noteWidth, 10000, 1);

      // Define the plane's position.
      plane.position.x = 100 + noteWidth / 2 + 10;
      plane.position.y =
            window.innerHeight + this.camera.position.y + 10000 / 2;
      plane.position.z = 0;

      // Add that plane to the scene.
      this.scene.add(plane);
    },
  },
};
</script>
