<template>
    <div class="horizontal-slider">
        <input type="range" :min="min" :max="max" :value="value" @input="updateValue($event.target.value)" class="slider"
            orient="horizontal">
        <div class="label">{{ label }}</div>
    </div>
</template>
  
<script>
export default {
    name: 'HorizontalSlider',
    props: {
        value: {
            type: Number,
            required: true
        },
        min: {
            type: Number,
            default: 0
        },
        max: {
            type: Number,
            default: 100
        },
        label: {
            type: String,
            default: ""
        }
    },
    methods: {
        updateValue(value) {
            // When the slider value changes, emit the 'input' event
            this.$emit('input', Number(value));
            // Update the background image for the slider
            let percent100 = (value - this.min) / (this.max - this.min) * 100;
            let bg = `linear-gradient(90deg, var(--bg-value-color) 0%, var(--bg-value-color) ${percent100}%, var(--bg-range-color) ${percent100}%, var(--bg-range-color) 100%)`;
            this.$el.querySelector('input').style.backgroundImage = bg;
        }
    }
}
</script>
  
<style scoped>
.horizontal-slider {
    height: 50px;
    width: 300px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.slider {
    writing-mode: bt-lr;
    /* IE */
    -webkit-appearance: slider-horizontal;
    /* WebKit */
    width: 200px;
    height: 20px;
    padding: 0;
    margin: 0;
    background: #d3d3d3;
    outline: none;
    opacity: 0.7;
    -webkit-transition: .2s;
    transition: opacity .2s;
}

.label{
    text-align: center;
    font-size: 14px;
    margin-top: 10px;
}

.slider:hover {
    opacity: 1;
}
</style>
  