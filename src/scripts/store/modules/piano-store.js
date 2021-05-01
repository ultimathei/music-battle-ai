/**
 * Store module for the piano
 */
import {
  MUT_pianoHeight,
  MUT_pianoKeysize,
  MUT_pianoOctaveCount,
  MUT_pianoScale,
  MUT_pianoPanelWidth,
  PIANO_MUTATION_WIDTH,
} from "../mutations";
import {
  ACT_pianoSetHeight,
  ACT_pianoSetKeysize,
  ACT_pianoSetOctaveCount,
  ACT_pianoSetScale,
  ACT_pianoSetPanelWidth,
  ACT_pianoSetWidth,
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
    [MUT_pianoHeight](state, data) {
      state.height = data;
    },
    [MUT_pianoKeysize](state, data) {
      state.keySize = data;
    },
    [MUT_pianoOctaveCount](state, data) {
      state.octaveCount = data;
    },
    [MUT_pianoScale](state, data) {
      state.scale = data;
    },
    [MUT_pianoPanelWidth](state, data) {
      state.sidePanelWidth = data;
    },
    [PIANO_MUTATION_WIDTH](state, data) {
      state.width = data;
    },
  },

  actions: {
    [ACT_pianoSetHeight]({ commit }, data) {
      commit(MUT_pianoHeight, data);
    },
    [ACT_pianoSetKeysize]({ commit }, data) {
      commit(MUT_pianoKeysize, data);
    },
    [ACT_pianoSetOctaveCount]({ commit }, data) {
      commit(MUT_pianoOctaveCount, data);
    },
    [ACT_pianoSetScale]({ commit }, data) {
      commit(MUT_pianoScale, data);
    },
    [ACT_pianoSetPanelWidth]({ commit }, data) {
      commit(MUT_pianoPanelWidth, data);
    },
    [ACT_pianoSetWidth]({ commit }, data) {
      commit(PIANO_MUTATION_WIDTH, data);
    },
  },
};
