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
  border: 1px solid #31a137;
  color:#e2d690;
  border-radius: 8px;
  padding: 3px;
  margin: 1px;
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
