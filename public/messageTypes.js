// TODO These need to go in a central constants place. 
// TODO : I also have them in main.vue (delete them from there also)
const messageType = Object.freeze({
    STATUS: "status",
    INFERENCE: "inference",
  });
const statusType = Object.freeze({
    LOADED: "loaded", // it applies for any type of worker
    WARMUP: "warmup",// it usually applies for neural network workers
    SUCCESS: "success",// can be used for any type of worker
    ERROR: "error",// can be used for any type of worker
});