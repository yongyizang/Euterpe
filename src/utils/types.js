export const playerType = {
  HUMAN: 0,
  AGENT: 1,
  METRONOME: 2,
};
export const instrumentType = {
  PIANO: 0,
  DRUMS: 1,
  BASS: 2,
  SYNTH: 3,
};
export const instNamesMap = {
  0: 'piano',
  1: 'drums',
  2: 'upright_bass',
  3: 'synth',
};

export const eventSourceType = {
  MOUSE: 0, // for on-screen keyboard
  MIDI_KEYBOARD: 1, // external midi keyboard
  KEYBOARD: 2, // laptop keyboard
};

export const messageType = {
  STATUS: 0,
  NOTE_LIST: 4,
  AUDIO_BUFFER: 7,
  CHROMA_VECTOR: 10,
  VECTOR: 11,
  CHORD_LABEL: 12,
  LABEL: 14,
  TEXT: 13,
  CLOCK_TIME: 1,
  INFERENCE_TIME: 2,
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
};

export const agentHookType = {
  CLOCK_EVENT: 0,
  NOTE_EVENT: 1,
  INIT_AGENT: 2,
};
