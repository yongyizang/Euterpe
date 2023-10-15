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
import * as THREE from "three";
import { Midi } from "@tonaljs/tonal";
import("../css/variables.css");

// get --pianoRoll-human-color and --pianoRoll-worker-color from CSS.
const colorForWorker = getComputedStyle(document.documentElement).getPropertyValue(
  "--pianoRoll-worker-color"
);
const colorForHuman = getComputedStyle(document.documentElement).getPropertyValue(
  "--pianoRoll-human-color"
);
const keyboardHeight = 210;



export default {
    name: "PianoRollComponent",

    data() {
        return {
        lastUpdateTime: 0,
        currentNotes: {},
        renderer: null,
        scene: null,
        camera: null,
        };
    },

    created() {
        this.$root.$refs.pianoRoll = this;
        // console.log("created PianoRoll", this);
    },

    mounted() {
        this.geometry = new THREE.PlaneGeometry(1, 1, 1); // A basic plane.
        this.humanMaterial = new THREE.MeshBasicMaterial({
            color: 'red',
            side: THREE.DoubleSide,
        });
        
        // console.log("mounted PianoRoll", this);
        this.init();
        this.animate();
        this.resize();
        setTimeout(this.keyDownDummy, 3000);
        // this.scene = new THREE.Scene();
        // this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

        // this.renderer = new THREE.WebGLRenderer();
        // this.renderer.setSize( window.innerWidth, window.innerHeight );
        // // document.body.appendChild( renderer.domElement );
        // this.$refs.canvas.appendChild( this.renderer.domElement );
        // this.geometry = new THREE.BoxGeometry( 1, 1, 1 );
        // this.material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        // this.cube = new THREE.Mesh( this.geometry, this.material );
        // this.scene.add( this.cube );

        // this.camera.position.z = 5;

        // this.animate();
    },

    methods: {
        // animate() {
        //     // console.log("animate");
        //     requestAnimationFrame( this.animate );

        //     this.cube.rotation.x += 0.01;
        //     this.cube.rotation.y += 0.01;

        //     this.renderer.render( this.scene, this.camera );
        // },
        init() {
        // Initialize the scene, camera and renderer.
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(0, 1, 1, 0, 1, 1000);
        this.camera.position.z = 1;
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0xffffff, 0);
        this.renderer.sortObjects = false;
        this.$refs.canvas.appendChild(this.renderer.domElement);
        console.log("size of canvas is ", this.$refs.canvas.clientWidth, this.$refs.canvas.clientHeight);
        console.log("size of window is ", window.innerWidth, window.innerHeight);
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
            this.$refs.canvas.clientHeight - keyboardHeight
            // 1341, 950
        );
        console.log("after resizing")
        console.log("size of canvas is ", this.$refs.canvas.clientWidth, this.$refs.canvas.clientHeight);
        console.log("size of window is ", window.innerWidth, window.innerHeight);
        // console.log("size of renderer is ", this.renderer.getSize);
        },

        animate() {
            // Update lastUpdate time and compute the time difference since last update.
            const delta = Date.now() - this.lastUpdateTime;
            this.lastUpdateTime = Date.now();
            // Tell three.js to give us another frame!
            requestAnimationFrame(this.animate);
            // if (this.$store.getters.getClockStatus) {
                // Update camera position.
                // Camera moves down to give the illusion that every noteblock goes up.
                this.camera.position.y += (1 / 10) * delta;
            // }
            // Tell renderer to re-render.
            this.renderer.render(this.scene, this.camera);
        },
        keyDownDummy() {
            console.log("keyDown\n\n\n\n\n\n\n\n\n");
            // Define the noteblock plane.
            const plane = new THREE.Mesh(this.geometry,  this.humanMaterial);
            const noteWidth = 30;
            plane.scale.set(noteWidth, 10000, 1);

            // Define the plane's position.
            plane.position.x = 100 + noteWidth / 2 + 10;
            plane.position.y =
                window.innerHeight + this.camera.position.y + 10000 / 2;
            plane.position.z = 0;

            // Add that plane to the scene.
            this.scene.add(plane);

            // Register this noteblock to the currentNotes data.
            // const selector = (noteEvent.player == playerType.AGENT) ? playerType.AGENT + noteInput : playerType.HUMAN + noteInput;
            // if (!this.currentNotes.hasOwnProperty(selector)) {
            //     this.currentNotes[selector] = [];
            // }
            // this.currentNotes[selector].push({
            //     plane: plane,
            //     position: this.camera.position.y,
            // });
        },
    },
};
</script>
