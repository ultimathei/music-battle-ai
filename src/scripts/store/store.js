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

  // other, non module stores if any
  state: {
    mode: "seed", // seed / playback / game
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
  },
  // used for asyncronous transactions
  actions: {
    // this should be in main store ?
    noteTrigger({ state, getters, commit }, payload) {
      let time = getters["mainClockStore/currentMusicalTime"];
      const data = {
        on_message: payload.on_message,
        note: payload.note,
        time: time,
        velocity: payload.velocity,
      };

      // UI mods
      commit("mutateCurrentlyPressedNotes", data);
      // console.log("currentlyPressedNotes: ", state.currentlyPressedNotes);

      // SOUND playback
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

      // RECORDING the note changes
      if (state.sessionStore.userTurn && state.mainClockStore.isRunning) {
        this.dispatch(SESSION_STORE_LOC + "recordNoteChanges", data);
      } else {
        // record premature note change
        this.dispatch(SESSION_STORE_LOC + "recordPrematureNote", data);
      }
    },
  },
});
