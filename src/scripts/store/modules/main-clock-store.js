/**
 * Store module for the main clock of the app
 */
 import {
  CLOCK_MUTATION_UPDATE_CURRENT_DEMISEMIQUAVER,
  CLOCK_MUTATION_UPDATE_CURRENT_BAR,
} from "../mutations";
import {
  CLOCK_ACTION_UPDATE_CURRENT_DEMISEMIQUAVER,
  CLOCK_ACTION_UPDATE_CURRENT_BAR,
} from "../actions";

export default {
  namespaced: true,
  state: () => ({
    currentDemisemiquaver: 0,
    currentBar: 0,
  }),

  getters: {
    currentDemisemiquaver(state) {
      return state.currentDemisemiquaver;
    },
    currentBar(state) {
      return state.currentBar;
    },
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
  },

  actions: {
    [CLOCK_ACTION_UPDATE_CURRENT_DEMISEMIQUAVER]({ commit }, data) {
      commit(CLOCK_MUTATION_UPDATE_CURRENT_DEMISEMIQUAVER, data);
    },
    [CLOCK_ACTION_UPDATE_CURRENT_BAR]({ commit }, data) {
      commit(CLOCK_MUTATION_UPDATE_CURRENT_BAR, data);
    },
  },
};
