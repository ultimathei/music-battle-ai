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
import axios from "axios";

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
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("userToken") || null,
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
    token(state) {
      return state.token;
    },
    isLoggedIn(state) {
      return state.token != null;
    },
    userName(state) {
      return state.user.name || "Champion";
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
    destroyToken(state) {
      localStorage.removeItem("user");
      localStorage.removeItem("userToken");
      state.token = null;
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
    async authenticate({ state }, formData) {
      try {
        const { data } = await axios.post("http://localhost:1337/auth/local", {
          identifier: formData.get("email"),
          password: formData.get("password"),
        });

        // success
        // console.log(data);
        let projection = {
          _id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          level: data.user.profile.level,
          allTimeScore: data.user.profile.all_time_score,
        };
        state.user = projection;
        localStorage.setItem("user", JSON.stringify(projection));
        state.token = data.jwt;
        localStorage.setItem("userToken", data.jwt);
        return { success: true };
      } catch (error) {
        console.log(error);
        // fail
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
      if (!response.success) {
        console.error(response.message);
      } else {
        state.savedBattles = response.battles;
      }
      // set loading to false?
    },

    async fetchUserBattles({ state }) {
      // from local storage for now..
      console.log("fetching user's battles from database..");

      // get my battles
      try {
        const { data } = await axios.get(
          `http://localhost:1337/battles?profile.user_eq=${state.user._id}`,
          {
            headers: { Authorization: `Bearer ${state.token}` },
          }
        );
        return { success: true, battles: data };
      } catch (error) {
        return { success: false, message: "could not read Database" };
      }
    },

    // SAVING
    async saveBattle({ state, dispatch }, newBattle) {
      console.log("saving battle here..");
      // read user battles from DB to make sure we are using the up to date list
      let response = await dispatch("fetchUserBattles");
      if (!response.success) {
        console.error(response.message);
        return;
      }
      // else
      // users battles
      let battles_previousState = response.battles;

      // info about battle to be saved
      let battles_newState = [];

      let streakIndex = this.getters[SESSION_STORE_LOC + "streakIndex"];
      // console.log('streakIndex', streakIndex);

      // save to DB

      // if not empty -- existing battles
      if (battles_previousState.length > 0) {
        let lastBattle =
          battles_previousState[battles_previousState.length - 1];

        // console.log('lastBattle', lastBattle);

        // continuation, so update latest battle data
        if (streakIndex > 0) {
          // ongoing battle, so push this round to rounds array
          const { data } = await axios.put(
            `http://localhost:1337/battles/${lastBattle.id}`,
            {
              data: {
                seedMelody: lastBattle.data.seedMelody,
                rounds: [...lastBattle.data.rounds, ...newBattle.rounds],
              },
            },
            {
              headers: { Authorization: `Bearer ${state.token}` },
            }
          );
          // console.log(data);
        } else {
          // new battle, so push new battle to battles array

          // HERE
          // create new battle and fetch all battles of user again to update local store
          const { data } = await axios.post(
            `http://localhost:1337/battles`,
            {
              data: newBattle,
              profile: lastBattle.profile,
            },
            {
              headers: { Authorization: `Bearer ${state.token}` },
            }
          );
        }
      } else {
        // no battles yet for user, this will be the first
        // step1. get profile
        const profileResp = await axios.get(
          `http://localhost:1337/profiles?_user.id=${state.user._id}`,
          {
            headers: { Authorization: `Bearer ${state.token}` },
          }
        );
        let prof = profileResp.data[0];
        // step2. create battle with profile
        const { data } = await axios.post(
          `http://localhost:1337/battles`,
          {
            data: newBattle,
            profile: prof,
          },
          {
            headers: { Authorization: `Bearer ${state.token}` },
          }
        );
      }

      response = await dispatch("fetchUserBattles");
      battles_newState = response.battles;
      state.savedBattles = battles_newState;
      // console.log('battles_newState', battles_newState);

      dispatch("updateTotalScore", battles_newState);
    },

    async updateTotalScore({ state }, battles_newState) { 
      // update daily
      let todayDate = new Date();
      todayDate = todayDate.getDate();
      console.log('todayDate', todayDate);
      let battlesToday = battles_newState.filter(item => {
        let createdDay = new Date(item.created_at);
        createdDay = createdDay.getDate();
        console.log(createdDay);
        return todayDate == createdDay;
      });
      state.dailyTotal = calculateTotalScore(battlesToday);

      // update it in profile?
      const { data } = await axios.get(
        `http://localhost:1337/profiles?_user.id=${state.user._id}`,
        {
          headers: { Authorization: `Bearer ${state.token}` },
        }
      );
      const respp = await axios.put(
        `http://localhost:1337/profiles/${data[0].id}`,
        {
          all_time_score: calculateTotalScore(battles_newState),
          daily_score: state.dailyTotal
        },
        {
          headers: { Authorization: `Bearer ${state.token}` },
        }
      );
    },

    async getProfileDetails({ state }) {
      const { data } = await axios.get(
        `http://localhost:1337/profiles?_user.id=${state.user._id}`,
        {
          headers: { Authorization: `Bearer ${state.token}` },
        }
      );

      return data[0];
    },

    async getTopAllTime({ state }) {
      const { data } = await axios.get(`http://localhost:1337/profiles`, {
        headers: { Authorization: `Bearer ${state.token}` },
      });

      // sort by all time score
      function compare(a, b) {
        if (a.all_time_score > b.all_time_score) {
          return -1;
        }
        if (a.all_time_score < b.all_time_score) {
          return 1;
        }
        return 0;
      }

      data.sort(compare);
      return data.slice(0, 5).map((item) => {
        return {
          score: item.all_time_score,
          username: item.user.username,
        };
      });
    },

    async getTopFiveToday({ state }) {
      const { data } = await axios.get(`http://localhost:1337/profiles`, {
        headers: { Authorization: `Bearer ${state.token}` },
      });

      // sort by all time score
      function compare(a, b) {
        if (a.daily_score > b.daily_score) {
          return -1;
        }
        if (a.daily_score < b.daily_score) {
          return 1;
        }
        return 0;
      }

      data.sort(compare);
      return data.slice(0, 5).map((item) => {
        return {
          score: item.daily_score,
          username: item.user.username,
        };
      });
    },
  },
});
