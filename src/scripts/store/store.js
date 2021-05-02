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
  ACT_instrumentStartNote,
  ACT_instrumentEndNote,
} from "../store/actions";

import { convertToPatternTime } from "../utils/utils";

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
  DONE: "done",
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
    singleActiveNote: null,
  },
  getters: {
    mode(state) {
      return state.mode;
    },
    currentlyPressedNotes(state) {
      return state.currentlyPressedNotes;
    },
    singleActiveNote(state) {
      return state.singleActiveNote;
    },
    isRecordingAllowed(state) {
      return (
        (state.mode == modes.SEED_RECORDING || state.mode == modes.BATTLE) &&
        state.mainClockStore.isRunning &&
        state.mainClockStore.precountDemisemiquaver >= 32 &&
        state.sessionStore.userTurn
      );
    },
  },
  // used for syncronous transactions
  mutations: {
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
      let time = getters[CLOCK_STORE_LOC + "currentMusicalTime"];
      const data = {
        on_message: payload.on_message,
        note: payload.note,
        time: time,
        velocity: payload.velocity,
      };

      // Add note to currently pressed notes array
      dispatch("updateCurrentlyPressedNotes", data);
    },

    updateCurrentlyPressedNotes({ state, dispatch }, data) {
      //  Monophonic way
      // console.log(data);
      let isUserTurn =
        this.getters["sessionStore/userTurn"] && state.mode != "seed_edit";
      if (data.on_message) {
        if (state.singleActiveNote) {
          if (isUserTurn)
            this.dispatch(
              INSTRUMENT_STORE_LOC + ACT_instrumentEndNote,
              state.singleActiveNote
            );
          state.currentlyPressedNotes.push(state.singleActiveNote);
        }
        state.singleActiveNote = data.note;
        if (isUserTurn)
          this.dispatch(
            INSTRUMENT_STORE_LOC + ACT_instrumentStartNote,
            data.note
          );
      } else {
        // note ended
        if (data.note == state.singleActiveNote) {
          if (isUserTurn)
            this.dispatch(
              INSTRUMENT_STORE_LOC + ACT_instrumentEndNote,
              state.singleActiveNote
            );
          if (state.currentlyPressedNotes.length > 0) {
            state.singleActiveNote = state.currentlyPressedNotes.pop();
            if (isUserTurn)
              this.dispatch(
                INSTRUMENT_STORE_LOC + ACT_instrumentStartNote,
                state.singleActiveNote
              );
          } else {
            state.singleActiveNote = null;
          }
        } else {
          let indexOfRemovable = state.currentlyPressedNotes.findIndex(
            (note) => note == data.note
          );
          if (indexOfRemovable > -1) {
            state.currentlyPressedNotes.splice(indexOfRemovable, 1);
          }
        }
      }

      // record change here
      dispatch("recordNotes");

      ///// ARCHIVED Polyphonic way
      // // console.log("note press change", data);
      // // find the note in the array with same pitch
      // const noteIndex = state.currentlyPressedNotes.findIndex(
      //   (el) => el == data.note
      // );
      // // if note is already added and its an off message
      // if (noteIndex > -1 && !data.on_message) {
      //   state.currentlyPressedNotes.splice(noteIndex, noteIndex + 1);
      // } else if (noteIndex < 0 && data.on_message) {
      //   // add note to array
      //   state.currentlyPressedNotes.push(data.note);
      // }
      /////////
    },

    saveBattle({ state }, battleObject) {
      let savedBattles = localStorage.getItem("savedBattles");
      let now = this.getters[SESSION_STORE_LOC + "sessionCreated"];
      if (savedBattles) {
        savedBattles = JSON.parse(savedBattles);

        let lastBattle = savedBattles[savedBattles.length - 1];
        if (lastBattle.created == now) {
          lastBattle.rounds.push(...battleObject.rounds);
        } else {
          savedBattles.push({
            ...battleObject,
            created: now,
          });
        }

        savedBattles = JSON.stringify(savedBattles);
      } else {
        savedBattles = `[${JSON.stringify({
          ...battleObject,
          created: now,
        })}]`;
      }
      localStorage.setItem("savedBattles", savedBattles);
    },

    /**
     * Records the notes to the appropriate array
     * @param {*} data the note object
     */
    recordNotes({ state, getters }) {
      if (getters.isRecordingAllowed) {
        const now = convertToPatternTime(
          this.getters[CLOCK_STORE_LOC + "currentMusicalTime"]
        );

        this.dispatch(SESSION_STORE_LOC + "switchNote", {
          pitch: state.singleActiveNote,
          now,
        });
      }
    },
  },
});
