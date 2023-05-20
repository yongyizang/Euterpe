export const messageType = {
    STATUS: 0,
    LOAD_ALGORITHM: 2,
    LOAD_CONFIG: 3,
    EVENTS_BUFFER: 5,
    NOTE_EVENT: 6,
    AUDIO_BUFFER: 7,
    INIT_AUDIO: 8,
    PREPARE_WAV: 9,
    WAV_BUFFER: 10,
  };
  
export const statusType = {
LOADED: 0,
WARMUP: 1,
SUCCESS: 2,
ERROR: 3,
REPORT: 4,
};

export const noteTypes = {
NOTE_ON: 1,
NOTE_OFF: -1,
NOTE_HOLD: 0,
REST: 2,
};