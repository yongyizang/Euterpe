<template>
  <div class="wrapper" :style="{ height: height + 'px', width: width + 'px' }">
    <div class="title" v-if="title">{{ title }}</div>
    <div class="text">
      <p>{{ text }}</p>
    </div>
  </div>
</template>

<script>
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
  }
}
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  justify-content: top;
  align-items: center;
  border: 1px solid #e0e0e0;
  color:#e0e0e0;
  border-radius: 4px;
  padding: 10px;
  margin: 10px;
}

.title {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 10px;
  position:relative;
}

.text {
  font-size: 1em;
  height: 100%;
  width: 100%;
  overflow-y: scroll;
}
</style>
