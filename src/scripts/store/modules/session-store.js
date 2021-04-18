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
  SESSION_MUTATION_ADD_NOTE_TO_CURRENT_PATTERN,
  SESSION_MUTATION_CLEAR_PATTERN,
  SESSION_MUTATION_ADD_PATTERN_TO_SESSION,
  SESSION_MUTATION_SET_USER_TURN,
} from "../mutations";

export default {
  namespaced: true,
  state: () => ({
    userTurn: true,
    currentUserPattern: [], // a list of notes in the pattern (user)
    currentResponsePattern: [], // a list of notes in the response pattern (robot)
    session: [], // a list of patterns in the session (user + robot)
  }),

  getters: {
    // current user pattern should consist two halves
    currentUserPattern(state) {
      return state.currentUserPattern;
    },
    session(state) {
      return state.session;
    },
  },

  // basiacally setters
  // using the ES2015 computed property name feature
  mutations: {
    // add new incoming notes (either start or end msg)
    [SESSION_MUTATION_ADD_NOTE_TO_CURRENT_PATTERN](state, data) {
      // its a start message push it straight to the pattern
      if (data.start) {
        state.currentUserPattern.push(data);
        return;
      }
      // else it's end message so
      // find the note that has no end yet (its start pair)
      for (let i in state.currentUserPattern) {
        let s = state.currentUserPattern[i];
        if (s.note === data.note && !s.end) {
          state.currentUserPattern[i] = {
            ...state.currentUserPattern[i],
            end: data.end,
          };
          return;
        }
      }
    },

    // when a pattern is complete, add it to the session (patterns list)
    // and clear the current pattern, so it's empty for the next pattern recording
    [SESSION_MUTATION_ADD_PATTERN_TO_SESSION](state) {
      // add current pattern to session
      const patternObject = {
        type: "user", // or 'robot'
        pattern: this.currentUserPattern, // or getResponsePattern()
      };
      state.session.push(patternObject);
      // clear current pattern
      state.currentUserPattern = [];
    },

    // should these be asynch?
    processFirstHalf() {
      // get notes in the first half of the pattern
      // generate the first half of the response based on it
      // store it locally
      // add it to current response pattern
    },
    processSecondHalf() {
      // get notes in the second half of the pattern
      // generate the second half of the response based on it
      // store it locally
      // add it to current response pattern
    },

    // clear/empty the current pattern
    [SESSION_MUTATION_CLEAR_PATTERN](state) {
      state.currentUserPattern = [];
    },

    // switch between user or robot turn
    [SESSION_MUTATION_SET_USER_TURN](state, data) {
      state.userTurn = data;
    }
  },
};
