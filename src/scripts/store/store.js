/**
 * The entry level store object
 */
import Vue from "vue";
import Vuex from "vuex";
import instrumentStore from "./modules/instrument-store";
import mainClockStore from "./modules/main-clock-store";
import midiStore from "./modules/midi-store";
import modelStore from "./modules/model-store";
import pianoStore from "./modules/piano-store";
import sessionStore from "./modules/session-store";
import {
  INSTRUMENT_ACTION_START_NOTE,
  INSTRUMENT_ACTION_END_NOTE,
} from "../store/actions";

Vue.use(Vuex);

const SESSION_STORE_LOC = "sessionStore/";
const INSTRUMENT_STORE_LOC = "instrumentStore/";
const CLOCK_STORE_LOC = "mainClockStore/";

// enumeration of possible modes
const modes = {
  INITIAL: "initial",
  PAUSED: "paused",
  SEED_RECORDING: "seed_recording",
  SEED_EDIT: "seed_edit",
  RECORDING: "recording",
  PLAYBACK: "playback",
  BATTLE: "battle",
  SCORING: "scoring",
  LOADING: "loading",
};

export default new Vuex.Store({
  modules: {
    // registering all imported store modules ..
    instrumentStore,
    mainClockStore,
    midiStore,
    modelStore,
    pianoStore,
    sessionStore,
  },

  // other, non module generic store objects
  state: {
    mode: modes.INITIAL,
    currentlyPressedNotes: [],
  },
  getters: {
    mode(state) {
      return state.mode;
    },
    currentlyPressedNotes(state) {
      return state.currentlyPressedNotes;
    },
  },
  // used for syncronous transactions
  mutations: {
    mutateCurrentlyPressedNotes(state, data) {
      // console.log("note press change", data);
      // find the note in the array with same pitch
      const noteIndex = state.currentlyPressedNotes.findIndex(
        (el) => el == data.note
      );
      // if note is already added and its an off message
      if (noteIndex > -1 && !data.on_message) {
        state.currentlyPressedNotes.splice(noteIndex, noteIndex + 1);
      } else if (noteIndex < 0 && data.on_message) {
        // add note to array
        state.currentlyPressedNotes.push(data.note);
      }
    },
    mutateMode(state, newVal) {
      state.mode = newVal;
    },
  },
  // used for asyncronous transactions
  actions: {
    /**
     * Trigger a note change
     * @param {*} payload the note data object
     */
    noteTrigger({ getters, commit, dispatch }, payload) {
      let time = getters[CLOCK_STORE_LOC+"currentMusicalTime"];
      const data = {
        on_message: payload.on_message,
        note: payload.note,
        time: time,
        velocity: payload.velocity,
      };

      // Add note to currently pressed notes array
      commit("mutateCurrentlyPressedNotes", data);

      // SOUND playback
      dispatch('playSounds', data);

      // RECORDING the note changes
      dispatch('recordNotes', data);
    },

    /**
     * Plays the sounds for the given note
     * @param {*} data the note object
     */
    playSounds({state}, data) {
      if (
        (state.mainClockStore.isRunning && state.sessionStore.userTurn) ||
        !state.mainClockStore.isRunning
      ) {
        if (data.on_message)
          this.dispatch(
            INSTRUMENT_STORE_LOC + INSTRUMENT_ACTION_START_NOTE,
            data.note
          );
        else
          this.dispatch(
            INSTRUMENT_STORE_LOC + INSTRUMENT_ACTION_END_NOTE,
            data.note
          );
      }
    },

    /**
     * Records the notes to the appropriate array
     * @param {*} data the note object
     */
    recordNotes({state}, data) {
      if (state.mainClockStore.isRunning && state.sessionStore.userTurn) {
        this.dispatch(SESSION_STORE_LOC + "recordNoteChanges", data);
      }
    },
  },
});
