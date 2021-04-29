/**
 * Store module for the recorded session
 * including a list of musical patterns played by
 * user and the responses played by app
 *
 * A session is a list of patterns.
 * A pattern is essentially 4 bars played by either the user or the response of
 * the app for the pattern.
 */
 import { convertToPatternTime } from "../../utils/utils";
import { SESSION_MUTATION_ADD_NOTE_TO_CURRENT_PATTERN } from "../mutations";
import {
  SESSION_ACTION_GENERATE_RESPONSES,
  SESSION_ACTION_CLEAR_SESSION,
  SESSION_ACTION_PLAY_CURRENT_NOTES,
  SESSION_ACTION_CONFIRM_SEED,
  SESSION_ACTION_CLOSE_UNFINISHED_NOTES,
  SESSION_ACTION_FINISHED_MELODY,
  SESSION_ACTION_LOADING,
  SESSION_ACTION_SET_AIMELODIES,
  SESSION_ACTION_PREMATURE_NOTE,
  INSTRUMENT_ACTION_START_NOTE,
  INSTRUMENT_ACTION_END_NOTE,
  INSTRUMENT_ACTION_END_ALL_NOTES,
  MODEL_ACTION_GENERATE_SIMILARS,
  CLOCK_ACTION_RESET_PRECOUNT,
  CLOCK_ACTION_STARTSTOP,
  CLOCK_ACTION_STOP,
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
    currentPattern: [],
    session: [], // a list of alternating user/response patterns

    // responseSequenceArray: [], // new
    // coreNoteSequence: null,
    isSessionLoading: false,

    // new approach
    seedMelody: null, // the seed melody of the session
    aiMelodyArray: [], // to store the melodies generated by the ai, based on seed
    userMelodyArray: [], // the user's attemps for each aiMelody
    prematureNotes: [], // this would be used to cache notes that are strated just before the pattern start
    // userTurn: ture // or false
    currentMatchIndex: 0, // the index of current match in the game session
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
    seedMelody(state) {
      return state.seedMelody;
    },
    userMelodyArray(state) {
      return state.userMelodyArray;
    },
    aiMelodyArray(state) {
      return state.aiMelodyArray;
    },
    isSessionLoading(state) {
      return state.isSessionLoading;
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

    // message recieved from clock at the end of each 4-bar cycle
    [SESSION_ACTION_FINISHED_MELODY]({ state, dispatch }) {
      // stop all notes, this prevents overflows
      this.dispatch(INSTRUMENT_STORE_LOC + INSTRUMENT_ACTION_END_ALL_NOTES);

      if (!state.seedMelody) {
        // send stop clock message
        console.log("at the end of seed melody, stop clock, display edit..");
        this.dispatch(CLOCK_STORE_LOC + CLOCK_ACTION_STOP);
      } else if (state.aiMelodyArray.length < 1 && state.userTurn) {
        console.log("whole session finished, stop the clock..");
        this.dispatch(CLOCK_STORE_LOC + CLOCK_ACTION_STOP);
      } else {
        console.log("still have melodies to play, move to next..");
        dispatch("moveToNextMelody");
      }
    },

    async [SESSION_ACTION_CONFIRM_SEED]({ state, dispatch }) {
      // state.isSessionLoading = true; // use this to display loader?
      // as confirmed make current pattern the seed
      state.seedMelody = state.currentPattern;

      // get ai melodies
      await this.dispatch(
        MODEL_STORE_LOC + MODEL_ACTION_GENERATE_SIMILARS,
        convertToMagentaSample(state.seedMelody, 120, 8)
      );
      // console.log("samples in session", aiMelodies);
      // state.aiMelodyArray = aiMelodies;
      state.isSessionLoading = false;

      dispatch("nextRobotMelody");

      // reset precount and start the battle
      this.dispatch(CLOCK_STORE_LOC + CLOCK_ACTION_RESET_PRECOUNT);
      this.dispatch(CLOCK_STORE_LOC + CLOCK_ACTION_STARTSTOP);
    },

    [SESSION_ACTION_SET_AIMELODIES]({ state }, melodiesArray) {
      state.aiMelodyArray = melodiesArray;
    },

    [SESSION_ACTION_LOADING]({ state }) {
      state.isSessionLoading = true;
    },

    // make an action variable for this?
    moveToNextMelody({ state, dispatch }) {
      // move to next melody
      if (state.userTurn) {
        dispatch("nextRobotMelody");
      } else {
        dispatch("nextUserMelody");
      }
    },

    nextRobotMelody({ state, dispatch }) {
      console.log("transitioning from USER to ROBOT turn..");
      dispatch(SESSION_ACTION_CLOSE_UNFINISHED_NOTES);
      // 1. push old current pattern to session
      const patternToArchive = {
        type: "user",
        pattern: [...state.currentPattern],
      };

      state.session.push(patternToArchive);
      state.userMelodyArray.push(patternToArchive);

      // 2. get the next element from the start of the ai array
      let melody = state.aiMelodyArray.shift();
      // console.log(melody);
      // 3. add it as the current pattern
      state.currentPattern = convertFromMagentaSequence(melody);
      // flip user turn boolean
      state.userTurn = false;
    },

    nextUserMelody({ state }) {
      console.log("transitioning from ROBOT to USER turn..");
      // 1. push old current pattern to session
      const patternToArchive = {
        type: "robot",
        pattern: [...state.currentPattern],
      };

      state.session.push(patternToArchive);
      // state.  .push(patternToArchive);

      // clear current pattern - make it ready for user to play
      state.currentPattern = [];
      // flip user turn boolean
      state.userTurn = true;
    },

    // modified now -- not used now
    [SESSION_ACTION_GENERATE_RESPONSES]({ state, dispatch }) {
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
        if (state.responseSequenceArray.length < 1) {
          // stop playback
          this.dispatch(CLOCK_STORE_LOC + CLOCK_ACTION_STARTSTOP);
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

    // clear/empty the current session
    [SESSION_ACTION_CLEAR_SESSION]({ state }) {
      state.seedMelody = null;
      state.currentPattern = [];
      state.aiMelodyArray = [];
      state.session = [];
      state.userTurn = true;
    },

    [SESSION_ACTION_CLOSE_UNFINISHED_NOTES]({ state }) {
      for (let n of state.currentPattern) {
        if (!n.end || n.end > 128) {
          n.end = 128;
        }
        if (!n.start) {
          n.start = 0;
        }
      }
    },

    [SESSION_ACTION_PREMATURE_NOTE]({ state }, note) {
      // console.log(note);
      if (note.start) {
        // add to premature array
        console.log("prem note added");
        state.prematureNotes.push(note);
      } else {
        console.log("prem note removed");
        // removing the note with same pitch
        state.prematureNotes = state.prematureNotes.filter(
          (n) => n.note != note.note
        );
      }
      // console.log('prem notes: ', state.prematureNotes)
    },

    // recordNote({ state }) {
    //   // record to store at current time
    //   console.log("in here");
    //   // if (this.isRunning && this.userTurn)
    //   //   this.recordNoteChanges(on_message, note, this.currentMusicalTime);
    //   // else {
    //   //   // record premature note change
    //   //   this.recordPrematureNote(on_message, note);
    //   // }
    // },

    recordPrematureNote({dispatch}, payload) {
      // console.log('premature note detected..');
      let data = { note: payload.note };
      if (payload.on_message) data.start = true;
      else data.end = true;
      // send data here to store
      dispatch(SESSION_ACTION_PREMATURE_NOTE, data);
    },

    /**
     * Storing note MIDI messaged as they come in
     */
    recordNoteChanges({commit}, payload) {
      let data = { note: payload.note };
      if (payload.on_message) data.start = convertToPatternTime(payload.time);
      else data.end = convertToPatternTime(payload.time);
      // send data here to store
      commit(SESSION_MUTATION_ADD_NOTE_TO_CURRENT_PATTERN, data);
    },
  },

  // basiacally setters
  // using the ES2015 computed property name feature
  mutations: {
    // add new incoming notes (either start or end msg) ONLY when in user turn
    [SESSION_MUTATION_ADD_NOTE_TO_CURRENT_PATTERN](state, data) {
      if (!state.userTurn) return; // safety check

      // console.log(data);

      // its a start message push it straight to the pattern
      if (data.start) {
        state.currentPattern.push({
          ...data,
          start: Math.max(data.start - 1, 0), // why -1 ?
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
