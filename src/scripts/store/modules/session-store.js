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
} from "../mutations";

export default {
  namespaced: true,
  state: () => ({
    sessions: [
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
    sessions(state) {
      return state.sessions;
      // return [
      //   {
      //     note: 8,
      //     start: { pattern: 0, bar: 0, demisemi: 0 }, // pattern*128 + bar*32 + demisemi
      //     end: { pattern: 0, bar: 0, demisemi: 16 },
      //   },
      // ];
    },
  },

  // basiacally setters
  mutations: {
    // using the ES2015 computed property name feature
    [SESSION_MUTATION_ADD_NOTE](state, data) {
      // its a start message
      if(data.start) {
        state.sessions.push(data);
        console.log(state.sessions);
        return;
      }

      // else it's end message
      // find the note that has no end yet
      for (let i in state.sessions){
        let s = state.sessions[i];
        if(s.note === data.note) {
          if(!s.end) {
            state.sessions[i] = {...state.sessions[i], end: data.end}
            console.log(state.sessions);
            return;
          }
        }
      }
    },
  },
};
