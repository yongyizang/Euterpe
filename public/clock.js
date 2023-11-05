/* eslint-disable require-jsdoc */
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
    // console.log("tick");
}

self.onmessage = function(msg) {
    const data = msg.data;
    if (data.action === 'setBPM') {
        bpm = data.bpm;
        // if (isRunning) {
        //   stopClock();
        //   startClock();
        // }
    } else if (data.action === 'startClock') {
        startClock();
    } else if (data.action === 'stopClock') {
        stopClock();
    }
};
