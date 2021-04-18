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
  SESSION_MUTATION_CLEAR_SESSION,
  SESSION_MUTATION_SET_USER_TURN,
  SESSION_MUTATION_GENERATE_FIRST_HALF_RESPONSE,
  SESSION_MUTATION_GENERATE_SECOND_HALF_RESPONSE,
} from "../mutations";

export default {
  namespaced: true,
  state: () => ({
    userTurn: true,
    currentPattern: [],
    responsePatternHalf: [], // a list of notes in the response pattern (for first half)
    session: [], // a list of alternating user/response patterns
  }),

  getters: {
    // current user pattern should consist two halves
    // currentPattern(state) {
    //   return state.currentPattern;
    // },
    session(state) {
      return state.session;
    },
  },

  // basiacally setters
  // using the ES2015 computed property name feature
  mutations: {
    // add new incoming notes (either start or end msg) ONLY when in user turn
    [SESSION_MUTATION_ADD_NOTE_TO_CURRENT_PATTERN](state, data) {
      if (!state.userTurn) return; // safety check

      // its a start message push it straight to the pattern
      if (data.start) {
        state.currentPattern.push(data);
        return;
      }
      // else it's end message so
      // find the note that has no end yet (its start pair)
      for (let i in state.currentPattern) {
        let s = state.currentPattern[i];
        if (s.note === data.note && !s.end) {
          state.currentPattern[i] = {
            ...state.currentPattern[i],
            end: data.end,
          };
          return;
        }
      }
    },

    [SESSION_MUTATION_GENERATE_FIRST_HALF_RESPONSE](state) {
      if (!state.userTurn) return; // safety check

      // take a snapshot of notes in the first half of the user's pattern
      // generate the first half of the response based on it
      // store it locally by adding it to current response pattern

      // for now we simply return same pattern shifted half note up
      console.log("generate first half response here..");
      // TODO deal with unfinished notes pls..

      // should be asynch
      setTimeout(() => {
        state.responsePatternHalf = state.currentPattern.map((note) => {
          return {
            ...note,
            note: note.note + 1,
          };
        });
      }, 1000);
    },

    [SESSION_MUTATION_GENERATE_SECOND_HALF_RESPONSE](state) {
      // transitioning from user turn to response turn..
      if (state.userTurn) {
        // get notes in the second half of the pattern
        // generate the second half of the response based on it
        // when done, add it to current pattern (updating it)
        console.log("generate second half response here..");
        // 1. push old previous current pattern to session
        const patternToArchive = {
          type: "user",
          pattern: [...state.currentPattern],
        };
        state.session.push(patternToArchive);

        // 2. response pattern becomes the new current pattern
        state.currentPattern = [...state.responsePatternHalf];
        // clear response pattern
        state.responsePatternHalf = [];

        // this should be asynch!
        // get second half of response while playing the first half already
        setTimeout(() => {
          state.currentPattern = patternToArchive.pattern.map((note) => {
            return {
              ...note,
              note: note.note + 1,
            };
          });
        }, 1000);
      } else {
        // transitioning from response turn to user turn..
        // 1. push old current pattern to session
        const patternToArchive = {
          type: "robot",
          pattern: [...state.currentPattern],
        };
        state.session.push(patternToArchive);

        // clear current pattern - make it ready for user to play
        state.currentPattern = [];
      }
      // flip user turn boolean
      state.userTurn = !state.userTurn;
    },

    // clear/empty the current pattern
    [SESSION_MUTATION_CLEAR_SESSION](state) {
      state.currentPattern = [];
      state.userTurn = true;
      state.currentPattern = [];
      state.responsePatternHalf = [];
      state.session = [];
    },

    // switch between user or robot turn
    [SESSION_MUTATION_SET_USER_TURN](state, data) {
      state.userTurn = data;
    },
  },
};
