export const messageType = {
    STATUS: 0,
    LOAD_ALGORITHM: 2,
    LOAD_CONFIG: 3,
    CLOCK_EVENT: 5,
    NOTE_EVENT: 6,
    AUDIO_BUFFER: 7,
    INIT_AUDIO: 8,
    PREPARE_WAV: 9,
    WAV_BUFFER: 10,
    CHROMA_VECTOR: 11,
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