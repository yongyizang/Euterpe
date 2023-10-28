import Vue from 'vue';
import * as Tone from 'tone';
import Instruments from '@/utils/instruments';
import {Midi} from '@tonaljs/tonal';
import {
  playerType, instrumentType,
  instNamesMap,
} from '@/utils/types.js';

// window.onclick = () => {
//     Tone.start();
//     // Tone.context.lookAhead = 0;
// };

const state = {
  playersConfig: null,
  // master limiter
  limiter: null,
  // player's buses
  samplersAndBuses: {},
};

const getters = {
};

const actions = {

  samplerOnOff(context, noteEvent) {
    const durationInSeconds = noteEvent.duration.seconds + context.getters.getSecondsPerTick * noteEvent.duration.tick;
    const instrument_label = instNamesMap[noteEvent.instrument];
    if (noteEvent.player == playerType.AGENT) {
      let name = noteEvent.name;
      if (name == null) {
        name = Midi.midiToNoteName(noteEvent.midi, {sharps: true});
      }
      const instrument_to_play_on = context.state.samplersAndBuses['agent'].samplers[instrument_label];
      if (instrument_to_play_on == null) {
        throw new Error('Instrument ' + instrument_label + ' is not available for the Agent. Make sure it is declared in the config_players file.');
      } else {
        instrument_to_play_on.triggerAttackRelease(name, durationInSeconds, Tone.now() + noteEvent.playAfter.seconds, noteEvent.velocity / 127);
        // console.log("seconds", noteEvent.duration.seconds, "ticks", noteEvent.duration.tick, "secPerTick", context.getters.getSecondsPerTick);
        // instrument_to_play_on.triggerAttackRelease("C#0", durationInSeconds, Tone.now() + noteEvent.playAfter.seconds, noteEvent.velocity / 127);
      }
    }
  },
  samplerOn(context, noteEvent) {
    const instrument_label = instNamesMap[noteEvent.instrument];
    if (noteEvent.player == playerType.HUMAN) {
      const instrument_to_play_on = context.state.samplersAndBuses['human'].samplers[instrument_label];
      if (instrument_to_play_on == null) {
        throw new Error('Instrument ' + instrument_label + ' is not available for the Human. Make sure it is declared in the config_players file.');
      } else {
        // console.log("samplerON before play ", Tone.now());
        instrument_to_play_on.triggerAttack(noteEvent.name, Tone.now() + noteEvent.playAfter.seconds, noteEvent.velocity / 127);
      }
    } else if (noteEvent.player == playerType.AGENT) {
      // if noteEvent.name is null then use tonal.js to get the name of the note from noteEvent.midi
      let name = noteEvent.name;
      if (name == null) {
        name = Midi.midiToNoteName(noteEvent.midi, {sharps: true});
      }
      const instrument_to_play_on = context.state.samplersAndBuses['agent'].samplers[instrument_label];
      if (instrument_to_play_on == null) {
        throw new Error('Instrument ' + instrument_label + 'is not available for the Agent. Make sure it is declared in the config_players file.');
      } else {
        instrument_to_play_on.triggerAttack(name, Tone.now() + noteEvent.playAfter.seconds, noteEvent.velocity / 127);
      }
    } else if (noteEvent.player == playerType.METRONOME) {
      // console.log("click", noteEvent)
      context.state.samplersAndBuses['metronome'].samplers['click'].triggerAttack(noteEvent.name, Tone.now() + noteEvent.playAfter.seconds);
      // release the note 0.5s after the attack
      // TODO : make that depend on the beat duration
      context.state.samplersAndBuses['metronome'].samplers['click'].triggerRelease(noteEvent.name, Tone.now() + noteEvent.playAfter.seconds + 500);
    }
  },
  samplerOff(context, noteEvent) {
    const instrument_label = instNamesMap[noteEvent.instrument];
    if (noteEvent.player == playerType.HUMAN) {
      const instrument_to_play_on = context.state.samplersAndBuses['human'].samplers[instrument_label];
      if (instrument_to_play_on == null) {
        throw new Error('Instrument ' + instrument_label + ' is not available for the Human. Make sure it is declared in the config_players file.');
      } else {
        instrument_to_play_on.triggerRelease(noteEvent.name, Tone.now() + noteEvent.playAfter.seconds + 0.0);
      }
    } else if (noteEvent.player == playerType.AGENT) {
      let name = noteEvent.name;
      if (name == null) {
        name = Midi.midiToNoteName(noteEvent.midi, {sharps: true});
      }
      const instrument_to_play_on = context.state.samplersAndBuses['agent'].samplers[instrument_label];
      if (instrument_to_play_on == null) {
        throw new Error('Instrument ' + instrument_label + ' is not available for the Agent. Make sure it is declared in the config_players file.');
      } else {
        instrument_to_play_on.triggerRelease(name, Tone.now() + noteEvent.playAfter.seconds);
      }
    }
  },
};

const mutations = {

  stopMute(state) {
    for (const [player, playerData] of Object.entries(state.samplersAndBuses)) {
      if (player == 'human') {
        return;
      }
      playerData.bus.mute = true;
    }
  },
  startUnMute(state) {
    for (const [player, playerData] of Object.entries(state.samplersAndBuses)) {
      if (player == 'human') {
        return;
      }
      playerData.bus.mute = playerData.lastMuteState;
    }
  },

  createInstruments(state, config) {
    state.playersConfig = config.players;
    console.log('inside setInstrumentsConfig', state.playersConfig);
    state.limiter = new Tone.Limiter(-5).toDestination();
    // state.limiter = new Tone.Channel().toDestination();
    // const tremolo = new Tone.Tremolo(9, 0.75).toDestination().start();

    for (const [player, playerData] of Object.entries(state.playersConfig)) {
      const volumeDB = playerData.volume === 10 ? 0 : -Math.abs(20 * Math.log(playerData.volume / 10));
      state.samplersAndBuses[`${player}`] = {
        bus: new Tone.Channel().connect(state.limiter),
        lastMuteState: playerData.mute,
        lastLinVolumeState: volumeDB,
        samplersBus: {},
        samplers: {},
        lastStates: {},
      };
      state.samplersAndBuses[`${player}`].bus.volume.value = volumeDB;
      state.samplersAndBuses[`${player}`].bus.mute = playerData.mute;

      playerData.instruments.forEach((instrumentData) => {
        state.samplersAndBuses[`${player}`].samplersBus[`${instrumentData.id}`] = new Tone.Channel().connect(state.samplersAndBuses[`${player}`].bus);
        const volumeDB = instrumentData.volume === 10 ? 0 : -Math.abs(20 * Math.log(instrumentData.volume / 10));
        state.samplersAndBuses[`${player}`].samplersBus[`${instrumentData.id}`].volume.value = volumeDB;
        state.samplersAndBuses[`${player}`].samplersBus[`${instrumentData.id}`].mute = instrumentData.mute;
        state.samplersAndBuses[`${player}`].lastStates[`${instrumentData.id}`] = {
          volume: volumeDB,
          mute: instrumentData.mute,
        };
        if (instrumentData.id == 'synth') {
          state.samplersAndBuses[`${player}`].samplers[`${instrumentData.id}`] = new Tone.PolySynth(Tone.FMSynth, {voices: 24}).connect(state.samplersAndBuses[`${player}`].samplersBus[`${instrumentData.id}`]);
        } else {
          state.samplersAndBuses[`${player}`].samplers[`${instrumentData.id}`] = new Instruments().createSampler(instrumentData.id, (instrument) => {
            instrument.connect(state.samplersAndBuses[`${player}`].samplersBus[`${instrumentData.id}`]);
          });
        }
      });
    };
  },

  handleMixerUpdate(state, update) {
    let isVolume = false;
    let isMute = false;

    if (update.what == 'mute') {
      isMute = true;
    } else if (update.what == 'volume') {
      isVolume = true;
    } else {
      console.error('unknown mixer variable type, check confi_players.yaml, we only support \'mute\' and \'volume\'');
    }

    // find which bus
    const player = update.playerId;
    const instrument = update.instrumentId;
    let bus =state.samplersAndBuses[`${player}`].bus;
    if (instrument != null) {
      bus = state.samplersAndBuses[`${player}`].samplersBus[`${instrument}`];
    }

    if (isVolume == true) {
      const volume = update.value.value;
      const volumeDB = volume === 10 ? 0 : -Math.abs(20 * Math.log(volume / 10));
      bus.volume.value = volumeDB;
      if (instrument != null) {
        state.samplersAndBuses[`${player}`].lastStates[`${instrument}`].volume = volumeDB;
      } else {
        state.samplersAndBuses[`${player}`].lastLinVolumeState = volumeDB;
      }
    } else if (isMute == true) {
      bus.mute = update.value.value;
      if (instrument != null) {
        state.samplersAndBuses[`${player}`].lastStates[`${instrument}`].mute = update.value.value;
      } else {
        state.samplersAndBuses[`${player}`].lastMuteState = update.value.value;
      }
    }
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
