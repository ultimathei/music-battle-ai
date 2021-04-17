/**
 * Store module for the recorded session
 * including a list of musical patterns played by
 * user and the responses played by app
 *
 * A session is a list of patterns.
 * A pattern is essentially 4 bars played by either the user or the response of
 * the app for the pattern.
 */

 import {
  SESSION_MUTATION_ADD_NOTE,
  SESSION_MUTATION_CLEAR_PATTERN,
} from "../mutations";

export default {
  namespaced: true,
  state: () => ({
    currentUserPattern: [
      // {
      //   note: 8,
      //   // pattern*128 + bar*32 + demisemi
      //   start: 1,
      //   end: 32,
      // },

      // {
      //   note: 3,
      //   // pattern*128 + bar*32 + demisemi
      //   start: 24,
      //   end: 50,
      // },
    ],
  }),

  getters: {
    currentUserPattern(state) {
      return state.currentUserPattern;
    },
  },

  // basiacally setters
  mutations: {
    // using the ES2015 computed property name feature
    [SESSION_MUTATION_ADD_NOTE](state, data) {
      // its a start message
      if(data.start) {
        state.currentUserPattern.push(data);
        return;
      }

      // else it's end message
      // find the note that has no end yet
      for (let i in state.currentUserPattern){
        let s = state.currentUserPattern[i];
        if(s.note === data.note) {
          if(!s.end) {
            state.currentUserPattern[i] = {...state.currentUserPattern[i], end: data.end}
            return;
          }
        }
      }
    },

    [SESSION_MUTATION_CLEAR_PATTERN](state){
      state.currentUserPattern = [];
    },
  },
};
