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
  SESSION_MUTATION_GENERATE_FIRST_HALF_RESPONSE,
  SESSION_MUTATION_GENERATE_SECOND_HALF_RESPONSE,
} from "../mutations";

export default {
  namespaced: true,
  state: () => ({
    userTurn: true,
    currentPattern: [],
    previousPattern: [],
    currentUserPattern: [], // a list of notes in the pattern (user)
    currentResponsePattern: [], // a list of notes in the response pattern (robot)
    session: [], // a list of alternating user/response patterns
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

    // should these be asynch?
    [SESSION_MUTATION_GENERATE_FIRST_HALF_RESPONSE](state) {
      // take a snapshot of notes in the first half of the pattern
      // generate the first half of the response based on it
      // store it locally by adding it to current response pattern

      // for now we simply return same pattern shifted half note up
      if (state.userTurn) {
        console.log("generate first half response here..");
        // deal with unfinished notes pls..
        state.currentResponsePattern = state.currentPattern.map((note) => {
          return {
            ...note,
            note: note.note + 1,
          };
        });
      }
    },

    [SESSION_MUTATION_GENERATE_SECOND_HALF_RESPONSE](state) {
      // get notes in the second half of the pattern
      // generate the second half of the response based on it
      // store it locally
      // add it to current response pattern

      if (state.userTurn) {
        // transitioning from user turn to response turn..
        console.log("generate second half response here..");
        // 1. push old previous pattern to session
        if (state.previousPattern != []) {
          // patternIndex == 0 (or 1?)
          const patternToArchive = {
            type: "robot",
            pattern: [...state.previousPattern],
          };
          state.session.push(patternToArchive);
        }

        // 2. old current becomes new previous
        state.previousPattern = [...state.currentPattern];

        // 3. response pattern becomes the new current pattern
        state.currentPattern = [...state.currentResponsePattern];
        // clear response pattern
        state.currentResponsePattern = [];

        // get second half of response while playing the first half already
        setTimeout(() => {
          state.currentPattern = state.previousPattern.map((note) => {
            return {
              ...note,
              note: note.note + 1,
            };
          });
        }, 1000);
      } else {
        // transitioning from response turn to user turn..
        // 1. push old previous pattern to session
        if (state.previousPattern != []) {
          // patternIndex == 0 (or 1?)
          const patternToArchive = {
            type: "user",
            pattern: [...state.previousPattern],
          };
          state.session.push(patternToArchive);
        }

        // 2. old current becomes new previous
        state.previousPattern = [...state.currentPattern];

        // clear current pattern
        state.currentPattern = [];
      }
      // flip user turn boolean
      state.userTurn = !state.userTurn;
    },

    // // when a pattern is complete, add it to the session (patterns list)
    // // and clear the current pattern, so it's empty for the next pattern recording
    // [SESSION_MUTATION_ADD_PATTERN_TO_SESSION](state) {
    //   // here we should close all notes with no end yet
    //   // ..

    //   // add current pattern to session
    //   const patternObject = {
    //     type: "user", // or 'robot'
    //     pattern: this.currentUserPattern, // or getResponsePattern()
    //   };
    //   state.session.push(patternObject);
    //   // clear current pattern
    //   state.currentUserPattern = [];
    // },

    // clear/empty the current pattern
    [SESSION_MUTATION_CLEAR_PATTERN](state) {
      state.currentUserPattern = [];
    },

    // switch between user or robot turn
    [SESSION_MUTATION_SET_USER_TURN](state, data) {
      state.userTurn = data;
    },
  },
};
