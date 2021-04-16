/**
 * Store module for the piano
 */
import {
  PIANO_MUTATION_HEIGHT,
  PIANO_MUTATION_KEYSIZE,
  PIANO_MUTATION_OCTAVE_COUNT,
  PIANO_MUTATION_SCALE,
  PIANO_MUTATION_SIDE_PANEL_WIDTH,
  PIANO_MUTATION_WIDTH,
  PIANO_MUTATION_KEY_STATE,
} from "../mutations";
import {
  PIANO_ACTION_SET_HEIGHT,
  PIANO_ACTION_SET_KEYSIZE,
  PIANO_ACTION_SET_OCTAVE_COUNT,
  PIANO_ACTION_SET_SCALE,
  PIANO_ACTION_SET_SIDE_PANEL_WIDTH,
  PIANO_ACTION_SET_WIDTH,
  PIANO_ACTION_SET_KEY_STATE,
} from "../actions";

export default {
  namespaced: true,
  state: () => ({
    height: 500,
    keySize: 80,
    octaveCount: 1,
    scale: 0.5,
    sidePanelWidth: 200,
    keystate: null,
  }),

  getters: {
    aspectRatio(state, getters) {
      return state.height / getters.width;
    },
    blackKeySize(state) {
      return state.keySize / 2;
    },
    height(state) {
      return state.height;
    },
    keySize(state) {
      return state.keySize;
    },
    octaveCount(state) {
      return state.octaveCount;
    },
    scale(state) {
      return state.scale;
    },
    sidePanelWidth(state) {
      return state.sidePanelWidth;
    },
    // width(state) {
    //   return state.width;
    // },
    width(state) {
      return (
        state.sidePanelWidth +
        state.octaveCount * state.keySize * 7 +
        state.keySize
      );
    },
  },

  mutations: {
    // using the ES2015 computed property name feature
    // to use a constant as the function name
    [PIANO_MUTATION_HEIGHT](state, data) {
      state.height = data;
    },
    [PIANO_MUTATION_KEYSIZE](state, data) {
      state.keySize = data;
    },
    [PIANO_MUTATION_OCTAVE_COUNT](state, data) {
      state.octaveCount = data;
    },
    [PIANO_MUTATION_SCALE](state, data) {
      state.scale = data;
    },
    [PIANO_MUTATION_SIDE_PANEL_WIDTH](state, data) {
      state.sidePanelWidth = data;
    },
    [PIANO_MUTATION_WIDTH](state, data) {
      state.width = data;
    },
    [PIANO_MUTATION_KEY_STATE](state, data) {
      state.keystate = data;
    },
  },

  actions: {
    [PIANO_ACTION_SET_HEIGHT]({ commit }, data) {
      commit(PIANO_MUTATION_HEIGHT, data);
    },
    [PIANO_ACTION_SET_KEYSIZE]({ commit }, data) {
      commit(PIANO_MUTATION_KEYSIZE, data);
    },
    [PIANO_ACTION_SET_OCTAVE_COUNT]({ commit }, data) {
      commit(PIANO_MUTATION_OCTAVE_COUNT, data);
    },
    [PIANO_ACTION_SET_SCALE]({ commit }, data) {
      commit(PIANO_MUTATION_SCALE, data);
    },
    [PIANO_ACTION_SET_SIDE_PANEL_WIDTH]({ commit }, data) {
      commit(PIANO_MUTATION_SIDE_PANEL_WIDTH, data);
    },
    [PIANO_ACTION_SET_WIDTH]({ commit }, data) {
      commit(PIANO_MUTATION_WIDTH, data);
    },
    [PIANO_ACTION_SET_KEY_STATE]({ commit }, data) {
      console.log('action here..');
      // the idea here would be that somehow this action triggers the metronome
      // to return the current time (1/32nd unit)
      // ..
      // another aproach would be to create another store for metronome,
      // keep the current 32unit up to date there
      // and use a getter to get the value.. (or add an action, that pushes the note to
      // the music sheet array!) <-- TRY THIS
      commit(PIANO_MUTATION_KEY_STATE, data);
    },
  },
};
