<template>
    <div class="vertical-slider">
        <input type="range" :min="min" :max="max" :value="value" @input="updateValue($event.target.value)" class="slider"
            orient="vertical">
        <div class="label">{{ label }}</div>
    </div>
</template>
  
<script>
export default {
    name: 'VerticalSlider',
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
        }
    }
}
</script>
  
<style scoped>
.vertical-slider {
    height: 300px;
    width: 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.slider {
    writing-mode: bt-lr;
    /* IE */
    -webkit-appearance: slider-vertical;
    /* WebKit */
    width: 20px;
    height: 200px;
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
  