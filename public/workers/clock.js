// // the initial timeout time
// let bpm = 120;
// let timeoutTime =  1000*60/bpm/4;//vm.$store.getters.getClockPeriod;
// let aa = 0;
// // onmessage callback
// self.onmessage = function(msg){
// timeoutTime = parseInt(msg.data);
// };
// // the tick function which posts a message
// // and schedules a new tick
// function tick(){

// self.postMessage('tick');
// per = performance.now() - aa;
// // console.log("ClockWorker ",  Math.round(this.per), " bpm ", Math.round(60000/this.per/4));
// aa = performance.now()
// //   setTimeout(tick, timeoutTime);
// }
// // call tick initially
// aa = performance.now()
// // tick();
// setInterval(tick, timeoutTime);

let bpm = 100;
let isRunning = false;
let intervalId = null;

function startClock() {
  if (!isRunning) {
    isRunning = true;
    intervalId = setInterval(tick, 1000 * 60 / bpm / 4);
  }
}

function stopClock() {
  if (isRunning) {
    isRunning = false;
    clearInterval(intervalId);
  }
}

function tick() {
  postMessage('tick');
  console.log("tick");
}

self.onmessage = function (msg) {
  const data = msg.data;
  if (data.action === 'setBpm') {
    bpm = data.bpm;
    if (isRunning) {
      stopClock();
      startClock();
    }
  } else if (data.action === 'startClock') {
    startClock();
  } else if (data.action === 'stopClock') {
    stopClock();
  }
};