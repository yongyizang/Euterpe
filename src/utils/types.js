export const messageType = {
    STATUS: 0,
    NOTE_LIST: 4,
    AUDIO_BUFFER: 7,
    CHROMA_VECTOR: 11,
    CHORD_LABEL: 12,
    TEXT: 13,
    CLOCK_TIME: 1
};
  
export const statusType = {
    LOADED: 0,
    WARMUP: 1,
    SUCCESS: 2,
    ERROR: 3,
    REPORT: 4,
};

export const noteType = {
    NOTE_ON: 1,
    NOTE_OFF: -1,
    NOTE_HOLD: 0,
    REST: 2,
};

export const uiParameterType = {
    SLIDER_1: 0,
    SLIDER_2: 1,
    SLIDER_3: 2,
    SLIDER_4: 3,
    BUTTON_1: 4,
    BUTTON_2: 5,
    BUTTON_3: 6,
    BUTTON_4: 7,
    SWITCH_1: 8,
    SWITCH_2: 9,
    SWITCH_3: 10,
    SWITCH_4: 11,  
}
export const workerParameterType = {
    RMS : 0,
    LOUDNESS : 1,
    INFERENCE_TIME : 2,
}

export const workerHookType = {
    CLOCK_EVENT : 0,
    NOTE_EVENT : 1,
    INIT_WORKER: 2,
}