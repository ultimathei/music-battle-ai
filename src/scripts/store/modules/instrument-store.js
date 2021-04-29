/**
 * Store module for the playback instrument
 */

// put this to a synth/instrument store
const synthOptionsArray = [
  {
    oscillator: {
      type: "sine",
    },
  },
  {
    oscillator: {
      type: "sawtooth",
    },
  },
];
import { getNoteName } from "../../utils/utils";
import {
  INSTRUMENT_ACTION_START_NOTE,
  INSTRUMENT_ACTION_END_NOTE,
} from "../actions";

export default {
  namespaced: true,
  state: () => ({
    volume: null,
    filter: null,
    distortion: null,
    noise: null,
    synth: null,
    synthType: null,
    rangeStart: 60,
    rangeEnd: 84,
  }),

  getters: {
    volume(state) {
      if (!state.volume) {
        state.volume = new Tone.Volume(-5);
      }
      return state.volume;
    },
    filter(state) {
      if (!state.filter) {
        state.filter = new Tone.Filter({
          type: "notch",
          frequency: 300,
          rolloff: -12,
          Q: 3,
        });
      }
      return state.filter;
    },
    distortion(state) {
      if (!state.distortion) {
        state.distortion = new Tone.Distortion(0.1);
      }
      return state.distortion;
    },
    noise(state) {
      if (!state.noise) {
        state.noise = new Tone.Noise("brown");
      }
      return state.noise;
    },
    synthType(state) {
      if (!state.synthType) {
        state.synthType = 0;
      }
      return state.synthType;
    },
    synth(state, getters) {
      if (!state.synth) {
        state.synth = new Tone.PolySynth(Tone.Synth)
          .chain(
            getters.volume,
            getters.filter,
            // getters.distortion,
            Tone.Master
          )
          .set(synthOptionsArray[getters.synthType]);
      }
      return state.synth;
    },
    rangeStart(state) {
      return state.rangeStart;
    },
    rangeEnd(state) {
      return state.rangeEnd;
    },
    visibleNotes(state) {
      return Array.from(
        Array(state.rangeEnd - state.rangeStart + 1),
        (_, index) => state.rangeEnd - index
      );
    },
  },

  mutations: {
    // using the ES2015 computed property name feature
    // to use a constant as the function name
  },

  actions: {
    [INSTRUMENT_ACTION_START_NOTE]({getters}, note) {
      getters.synth.triggerAttack(getNoteName(note));
    },
    [INSTRUMENT_ACTION_END_NOTE]({getters}, note) {
      getters.synth.triggerRelease(getNoteName(note));
    },
  },
};
