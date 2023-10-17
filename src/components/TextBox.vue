<template>
    <div ref="textBox" class="wrapper" :style="{ height: height + 'px', width: width + 'px' }" @mousedown="startDrag">
        <div class="title" v-if="title">{{ title }}</div>
        <div class="text">
            <p>{{ text }}</p>
        </div>
        
    </div>
</template>

<script>
import "../css/variables.css";
export default {
    name: "TextBox",
    props: {
        height: {
            type: Number,
            required: true
        },
        width: {
            type: Number,
            required: true
        },
        title: {
            type: String,
            default: null
        },
        text: {
            type: String,
            default: ""
        }
    },
    methods: {
        startDrag(event) {
            if (typeof event.target.className !== 'string') return;
            // if that string contains 'fldv' or 'rotv'
            if (event.target.className.includes('title')) {
                this.isDragging = true;
                this.offsetX = this.$refs.textBox.getBoundingClientRect().right - event.clientX;
                this.offsetY = event.clientY - this.$refs.textBox.getBoundingClientRect().top;
                window.addEventListener('mousemove', this.handleDrag);
                window.addEventListener('mouseup', this.stopDrag);
                
            }
        },
        handleDrag(event) {
            if (this.isDragging) {
                // Update the element's position based on the mouse movement
                this.$refs.textBox.style.right = window.innerWidth - event.clientX - this.offsetX + 'px';
                this.$refs.textBox.style.top = event.clientY - this.offsetY + 'px';
            }
        },
        stopDrag() {
            this.isDragging = false;
            window.removeEventListener('mousemove', this.handleDrag);
            window.removeEventListener('mouseup', this.stopDrag);
        }
    }
}
</script>

<style scoped>
.wrapper {
    display: flex;
    flex-direction: column;
    justify-content: top;
    align-items: center;
    border: 2px solid #a79c0f;
    color:#e6a100;
    border-radius: 8px;
    padding: 3px;
    margin: 1px;
    background-color: var(--grey-background-color);
}

.title {
    font-size: 1.2em;
    font-weight: bold;
    margin-bottom: 0px;
    position:relative;
}

.text {
    font-size: 2em;
    height: 100%;
    width: 100%;
    overflow-y: scroll;
    display: flex;
    justify-content: center; /* Center horizontally */
    align-items: center; /* Center vertically */
    text-align: center; /* Center text content */
}

.text::-webkit-scrollbar {
    display: none;
}
</style>
