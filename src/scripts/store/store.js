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

import { convertToPatternTime, calculateTotalScore } from "../utils/utils";
import { users_DB } from "../services/users_DB";
import { battles_DB } from "../services/battles_DB";

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
    user: null,
    mode: modes.INITIAL,
    currentlyPressedNotes: [],
    singleActiveNote: null,
    dailyGoal: 2000,
    dailyTotal: 0,
    isMenuOpen: false,
    currentPageOpen: "battle",
    fadeoutComplete: false,
    savedBattles: [],
  },
  getters: {
    user(state) {
      return state.user;
    },
    userName(state) {
      return state.user.name || 'Champion';
    },
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
    dailyGoal(state) {
      return state.dailyGoal;
    },
    dailyTotal(state) {
      return state.dailyTotal;
    },
    isMenuOpen(state) {
      return state.isMenuOpen;
    },
    currentPageOpen(state) {
      return state.currentPageOpen;
    },
    savedBattles(state) {
      return state.savedBattles;
    },
  },
  // used for syncronous transactions
  mutations: {
    mutateMode(state, newVal) {
      state.mode = newVal;
    },
    mutateIsMenuOpen(state, newVal) {
      state.isMenuOpen = newVal;
    },
    mutateCurrentPageOpen(state, newVal) {
      state.currentPageOpen = newVal;
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

    action_fadeoutComplete({ state }, newVal) {
      state.fadeoutComplete = newVal;
    },

    /**
     * Mock authentication -- not to be used in production
     */
    authenticate({ state }, formData) {
      let user = users_DB.find(
        (_) =>
          _.email == formData.get("email") &&
          _.password == formData.get("password")
      );

      if (user) {
        const { _id, name, email, level, allTimeScore, token } = user;
        let projection = {
          _id,
          name,
          email,
          level,
          allTimeScore,
          token,
        };
        state.user = projection; // set in vue store
        return { success: true, token: token };
      } else {
        return { success: false };
      }
    },

    findUserByToken({ state }, search_token) {
      let user = users_DB.find((_) => _.token == search_token);


      if (user) {
        const { _id, name, email, level, allTimeScore, token } = user;
        let projection = {
          _id,
          name,
          email,
          level,
          allTimeScore,
          token,
        };
        state.user = projection;
        return { success: true, token: token };
      } else {
        return { success: false };
      }
    },

    /**
     * BATTLES actions
     */
    async fetchSavedBattles({ state, dispatch }) {
      // from local storage for now..
      console.log("fetching all battles from database..");
      let response = await dispatch("fetchUserBattles");
      console.log(response);
      if(!response.success) {
        console.error(response.message);
      } else {
        state.savedBattles = response.battles;
      }
      // set loading to false?
    },
    
    fetchUserBattles({ state }) {
      // from local storage for now..
      console.log("fetching user's battles from database..");

      // read DB instance
      let battles_DB_instance = localStorage.getItem("battles_DB");
      // format: [{ user_id: "user._id", battles: [] }]
    
      if (!battles_DB_instance) {
        battles_DB_instance = battles_DB; // initial mock DB state from file
        localStorage.setItem("battles_DB", JSON.stringify(battles_DB_instance));
      } else {
        battles_DB_instance = JSON.parse(battles_DB_instance); // try-catch?
      }
      // get battles for a specific user from LC
      // aka find DB item with user_id == user._id
      let DB_object = battles_DB_instance.find((obj) => obj.user_id == state.user._id);
      // if didn't find, return error message?
      if (!DB_object) {
        return { success: false, message: "could not read Database"};
      }
      // else get the battles list of this user
      return {success: true, battles: DB_object.battles}
    },


    // SAVING
    async saveBattle({ state, dispatch }, newBattle) {
      console.log("saving battle here..");
      // read user battles from DB to make sure we are using the up to date list
      let response = await dispatch("fetchUserBattles");
      if(!response.success) {
        console.error(response.message);
        return;
      }
      // else
      // users battles
      let battles_previousState = response.battles;

      // info about battle to be saved
      let battles_newState = [];
      let now = this.getters[SESSION_STORE_LOC + "sessionCreated"];

      // if not empty -- existing battles
      if (battles_previousState.length > 0) {
        let lastBattle = battles_previousState[battles_previousState.length - 1];
        if (lastBattle.created == now) {
          // ongoing battle, so push this round to rounds array
          lastBattle.rounds.push(...newBattle.rounds);
        } else {
          // new battle, so push new battle to battles array
          battles_previousState.push({
            ...newBattle,
            _id: battles_previousState.length,
            created: now,
          });
        }
        battles_newState = battles_previousState;

      } else {
        // no battles yet for user, this will be the first 
        battles_newState.push({
          ...newBattle,
          _id: battles_previousState.length, // 0
          created: now,
        });
      }


      // need new method to store in LC in correct format
      // write
      let battles_DB_instance = JSON.parse(localStorage.getItem("battles_DB"));
      // format: [{ user_id: "user._id", battles: [] }]
      let index = battles_DB_instance.findIndex(obj=>obj.user_id == state.user._id);
      battles_DB_instance.splice(index, 1, {
        user_id: state.user._id,
        battles: battles_newState
      });
      // write update in LC (DB)
      localStorage.setItem("battles_DB", JSON.stringify(battles_DB_instance));

      // console.log(newSaved);
      // TODO: filter for todays battles only, 
      // where startof today created < endof today
      // ..
      // for now, no filtering (all time total score)
      state.dailyTotal = calculateTotalScore(battles_newState);
    },


  },
});
