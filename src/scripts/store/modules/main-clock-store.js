/**
 * Store module for the main clock of the app
 */
 import {
  CLOCK_MUTATION_UPDATE_CURRENT_32_UNIT,
} from "../mutations";
import {
  CLOCK_ACTION_UPDATE_CURRENT_32_UNIT,
} from "../actions";

export default {
  namespaced: true,
  state: () => ({
    current32unit: 0,
  }),

  getters: {
    current32unit(state) {
      return state.current32unit;
    },
  },

  mutations: {
    // using the ES2015 computed property name feature
    [CLOCK_MUTATION_UPDATE_CURRENT_32_UNIT](state, data) {
      state.current32unit = data;
    },
  },

  actions: {
    [CLOCK_ACTION_UPDATE_CURRENT_32_UNIT]({ commit }, data) {
      console.log('update clock in store here..');
      // the idea here would be that somehow this action triggers the metronome
      // to return the current time (1/32nd unit)
      // ..
      // another aproach would be to create another store for metronome,
      // keep the current 32unit up to date there
      // and use a getter to get the value.. (or add an action, that pushes the note to
      // the music sheet array!) <-- TRY THIS
      commit(CLOCK_MUTATION_UPDATE_CURRENT_32_UNIT, data);
    },
  },
};
