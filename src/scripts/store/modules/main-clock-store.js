/**
 * Store module for the main clock of the app
 */
 import {
  CLOCK_MUTATION_UPDATE_CURRENT_DEMISEMIQUAVER,
  CLOCK_MUTATION_UPDATE_CURRENT_BAR,
  CLOCK_MUTATION_UPDATE_CURRENT_PATTERN_IND,
} from "../mutations";
import {
  CLOCK_ACTION_UPDATE_CURRENT_DEMISEMIQUAVER,
  CLOCK_ACTION_UPDATE_CURRENT_BAR,
  CLOCK_ACTION_UPDATE_CURRENT_PATTERN_IND,
} from "../actions";

export default {
  namespaced: true,
  state: () => ({
    currentDemisemiquaver: 0,
    currentBar: 0,
    currentPatternInd: 0,
  }),

  getters: {
    currentDemisemiquaver(state) {
      return state.currentDemisemiquaver;
    },
    currentBar(state) {
      return state.currentBar;
    },
    currentPatternInd(state) {
      return state.currentPatternInd;
    },
    currentMusicalTime(state) {
      return {
        pattern: state.currentPatternInd,
        bar: state.currentBar,
        demisemi: state.currentDemisemiquaver
      }
    }
  },

  // basiacally setters
  mutations: {
    // using the ES2015 computed property name feature
    [CLOCK_MUTATION_UPDATE_CURRENT_DEMISEMIQUAVER](state, data) {
      state.currentDemisemiquaver = data;
    },
    [CLOCK_MUTATION_UPDATE_CURRENT_BAR](state, data) {
      state.currentBar = data;
    },
    [CLOCK_MUTATION_UPDATE_CURRENT_PATTERN_IND](state, data) {
      state.currentPatternInd = data;
    },
  },

  actions: {
    [CLOCK_ACTION_UPDATE_CURRENT_DEMISEMIQUAVER]({ commit }, data) {
      commit(CLOCK_MUTATION_UPDATE_CURRENT_DEMISEMIQUAVER, data);
    },
    [CLOCK_ACTION_UPDATE_CURRENT_BAR]({ commit }, data) {
      commit(CLOCK_MUTATION_UPDATE_CURRENT_BAR, data);
    },
    [CLOCK_ACTION_UPDATE_CURRENT_PATTERN_IND]({ commit }, data) {
      commit(CLOCK_MUTATION_UPDATE_CURRENT_PATTERN_IND, data);
    },
  },
};
