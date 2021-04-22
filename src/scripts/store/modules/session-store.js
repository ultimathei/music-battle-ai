/**
 * Store module for the recorded session
 * including a list of musical patterns played by
 * user and the responses played by app
 *
 * A session is a list of patterns.
 * A pattern is essentially 4 bars played by either the user or the response of
 * the app for the pattern.
 */

import { SESSION_MUTATION_ADD_NOTE_TO_CURRENT_PATTERN } from "../mutations";
import {
  SESSION_ACTION_GENERATE_SECOND_HALF_RESPONSE,
  SESSION_ACTION_CLEAR_SESSION,
  SESSION_ACTION_PLAY_CURRENT_NOTES,
  SESSION_ACTION_PREVIEW_BASE_PATTERN,
  SESSION_ACTION_CONFIRM_BASE_PATTERN,
  SESSION_ACTION_CLOSE_UNFINISHED_NOTES,
  INSTRUMENT_ACTION_START_NOTE,
  INSTRUMENT_ACTION_END_NOTE,
  MODEL_ACTION_GENERATE_SIMILARS,
  CLOCK_ACTION_STARTSTOP,
} from "../actions";
import {
  convertToMagentaSample,
  convertFromMagentaSequence,
} from "../../utils/utils";

const INSTRUMENT_STORE_LOC = "instrumentStore/";
const MODEL_STORE_LOC = "modelStore/";
const CLOCK_STORE_LOC = "mainClockStore/";

export default {
  namespaced: true,
  state: () => ({
    userTurn: true,
    prematureNotes: [], // this would be used to cache notes that are strated just before the pattern start
    currentPattern: [],
    responsePatternHalf: [], // a list of notes in the response pattern (for first half)
    session: [], // a list of alternating user/response patterns

    magentaModel: null, // new
    responseSequenceArray: [], // new
    isBaseConfirmed: false,
    coreNoteSequence: null,
    isSessionLoading: false,
  }),

  getters: {
    session(state) {
      return state.session;
    },
    userTurn(state) {
      return state.userTurn;
    },
    currentPattern(state) {
      return state.currentPattern;
    },
    magentaModel(state) {
      return state.magentaModel;
    },
    isBaseConfirmed(state) {
      return state.isBaseConfirmed;
    },
  },

  actions: {
    ////// IDEA ///////
    // idea for VAE interpolate
    // 1. take user's input first
    //  1.a from_sequence = user input notes
    //  1.b determine scale eg. scale = 'CM'
    // 2. get a sample: to_sequence = model.sample(1, 1.0, [scale]) ?? how to sepcify scale?
    // 3. results = vae.interpolate([from_sequence, to_sequence], num_of_interppolation_steps, 1.0, [scale])
    //////////////////
    /**
     * Playback of current pattern sound
     * @param {*} time
     */
    [SESSION_ACTION_PLAY_CURRENT_NOTES]({ state }, currentTime) {
      for (let note of state.currentPattern) {
        if (note.start && note.start == currentTime) {
          // play sound for note
          this.dispatch(
            INSTRUMENT_STORE_LOC + INSTRUMENT_ACTION_START_NOTE,
            note.note
          );
        } else if (note.end && note.end == currentTime) {
          // stop sound for note
          this.dispatch(
            INSTRUMENT_STORE_LOC + INSTRUMENT_ACTION_END_NOTE,
            note.note
          );
        }
      }
    },

    // TEST
    [SESSION_ACTION_PREVIEW_BASE_PATTERN]({ dispatch }) {
      console.log("confirm/edit here..");
      // closing off unfinished notes
      dispatch(SESSION_ACTION_CLOSE_UNFINISHED_NOTES);
    },

    async [SESSION_ACTION_CONFIRM_BASE_PATTERN]({ state }) {
      // init model
      state.isSessionLoading = true;

      let result = await this.dispatch(
        MODEL_STORE_LOC + MODEL_ACTION_GENERATE_SIMILARS,
        convertToMagentaSample(state.currentPattern, 120, 8)
      );

      console.log('samples in session', result);
      state.responseSequenceArray = result;
      state.isBaseConfirmed = true;

    },

    // // not used now
    // [SESSION_ACTION_GENERATE_FIRST_HALF_RESPONSE]({ state }) {
    //   if (!state.userTurn) return; // safety check

    //   // take a snapshot of notes in the first half of the user's pattern
    //   // generate the first half of the response based on it
    //   // store it locally by adding it to current response pattern

    //   // for now we simply return same pattern shifted half note up
    //   console.log("generate first half response here..");
    //   // TODO deal with unfinished notes pls..

    //   // should be asynch
    //   setTimeout(() => {
    //     state.responsePatternHalf = state.currentPattern.map((note) => {
    //       return {
    //         ...note,
    //         note: note.note + 1,
    //       };
    //     });
    //   }, 1000);
    // },

    // modified now
    [SESSION_ACTION_GENERATE_SECOND_HALF_RESPONSE]({ state, dispatch }) {
      // transitioning from user turn to response turn..
      if (state.userTurn) {
        console.log("generate ai patterns here..");
        dispatch(SESSION_ACTION_CLOSE_UNFINISHED_NOTES);
        // 1. push old current pattern to session
        const patternToArchive = {
          type: "user",
          pattern: [...state.currentPattern],
        };
        state.session.push(patternToArchive);

        // 2. response pattern becomes the new current pattern
        // state.currentPattern = [...state.responsePatternHalf];
        if (state.responseSequenceArray.length < 1) {
          // stop playback
          this.dispatch(CLOCK_STORE_LOC+CLOCK_ACTION_STARTSTOP);
          return;
        }

        let sample = state.responseSequenceArray.shift();
        console.log(sample);

        state.currentPattern = convertFromMagentaSequence(sample);
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
    [SESSION_ACTION_CLEAR_SESSION]({ state }) {
      state.currentPattern = [];
      state.responseSequenceArray = [];
      state.session = [];
      state.userTurn = true;
      state.isBaseConfirmed = false;
      state.coreNoteSequence = null;
    },

    async [SESSION_ACTION_CLOSE_UNFINISHED_NOTES]({state}) {
      for (let n of state.currentPattern) {
        if (!n.end) {
          n.end = 128;
        }
        if (!n.start) {
          n.start = 0;
        }
      }
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
        state.currentPattern.push({
          ...data,
          start: Math.max(data.start - 1, 0),
        });
        return;
      }
      // else it's end message so
      // find the note that has no end yet (its start pair)
      for (let i in state.currentPattern) {
        let s = state.currentPattern[i];
        if (s.note === data.note && !s.end) {
          // // if end and start is same, let's add one to start
          // if(data.end === s.start) {
          //   data.end+=1;
          // }
          state.currentPattern[i] = {
            ...state.currentPattern[i],
            end: data.end,
          };
          return;
        }
      }
    },

    ////////

    // IDEA
    // for prematureNotes: if not userTurn and MIDI not receieved:
    // collect theese notes to an array with start value 0.
    // is end note message received for same pitch, remove from array
    // at the start of a new user pattern, push the content of this array to
    // the currentPattern array

    ////////

    // // switch between user or robot turn
    // [SESSION_MUTATION_SET_USER_TURN](state, data) {
    //   state.userTurn = data;
    // },
  },
};
