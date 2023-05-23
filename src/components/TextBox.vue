<template>
  <div class="textbox">
    <input type="text" class="textbox-input" :value="text" readonly />
  </div>
</template>

<script>
export default {
  name: 'TextBox',
  props: {
    initialText: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      text: this.initialText
    };
  },
  methods: {
    updateText(newText) {
      this.text = newText;
    }
  }
};
</script>

<style scoped>
.textbox {
  /* display: inline-block; */
  position: relative;
  width: 100px;
  height: 200px;
  /* right: 20px; */
  border: none;
  background-color: transparent;
  text-align: center;
}

.textbox-input {
  font-weight: bold;
  color: red;
}
</style>