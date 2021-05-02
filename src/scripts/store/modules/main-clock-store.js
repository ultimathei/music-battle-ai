/**
 * Store module for the main clock of the app
 */
import {
  MUT_clockAudioContext,
  MUT_clockBipsInQueue,
  MUT_clockCurrentBar,
  MUT_clockCurrentDemisemiquaver,
  MUT_clockIntervalID,
  MUT_clockIsRunning,
  MUT_clockNextBipTime,
  MUT_clockMetronomeSoundOn,
} from "../mutations";
import {
  ACT_clockNextBip,
  ACT_clockScheduleBip,
  ACT_clockPlayMetronome,
  ACT_clockAdvanceScheduler,
  ACT_clockStart,
  ACT_clockStop,
  ACT_clockStartStop,
  ACT_clockReset,
  ACT_clockResetPrecount,
  ACT_sessionPlayCurrentNotes,
  ACT_sessionCloseUnfinishedNotes,
  ACT_sessionFinishedMelody,
  ACT_instrumentStartNote,
  ACT_instrumentEndNote,
} from "../actions";

const SESSION_STORE_LOC = "sessionStore/";
const INSTRUMENT_STORE_LOC = "instrumentStore/";
import { convertToPatternTime } from "../../utils/utils";

export default {
  namespaced: true,
  state: () => ({
    audioContext: null, // move to main store?
    bipsInQueue: [],
    precountDemisemiquaver: 0,
    currentBar: 0,
    currentDemisemiquaver: 0,
    denominator: 8,
    intervalID: null,
    isRunning: false,
    lookahead: 25,
    nextBipTime: 0.0,
    scheduleAheadTime: 0.1,
    metronomeSoundOn: true,
    metronomeFlashActive: false,
    tempo: 120, // fixed value for now
  }),

  getters: {
    audioContext(state) {
      return state.audioContext;
    },
    currentDemisemiquaver(state) {
      return state.currentDemisemiquaver;
    },
    currentBar(state) {
      return state.currentBar;
    },
    currentMusicalTime(state) {
      return {
        bar: state.currentBar,
        demisemi: state.currentDemisemiquaver,
      };
    },
    currentCursorPos(state) {
      return state.currentBar * 32 + state.currentDemisemiquaver;
    },
    isRunning(state) {
      return state.isRunning;
    },
    metronomeSoundOn(state) {
      return state.metronomeSoundOn;
    },
    metronomeFlashActive(state) {
      return state.metronomeFlashActive;
    },
    tempo(state) {
      return state.tempo;
    },
    precountDemisemiquaver(state) {
      return state.precountDemisemiquaver;
    },
  },

  // basiacally setters
  mutations: {
    // using the ES2015 computed property name feature
    [MUT_clockAudioContext](state, data) {
      state.audioContext = data;
    },
    [MUT_clockBipsInQueue](state, data) {
      state.bipsInQueue.push(data);
    },
    [MUT_clockCurrentBar](state, data) {
      state.currentBar = data;
    },
    [MUT_clockCurrentDemisemiquaver](state, data) {
      state.currentDemisemiquaver = data;
    },
    [MUT_clockIntervalID](state, data) {
      state.intervalID = data;
    },
    [MUT_clockIsRunning](state, data) {
      state.isRunning = data;
    },
    [MUT_clockNextBipTime](state, data) {
      state.nextBipTime = data;
    },
    [MUT_clockMetronomeSoundOn](state, data) {
      state.metronomeSoundOn = data;
    },
  },

  actions: {
    /**
     * Advanced the time to the next bip (by demisemiquaver)
     * @param {*} param0
     */
    [ACT_clockNextBip]({ state, getters }) {
      const secondsPerBeat = 60.0 / state.tempo; // as tempo is in bpm

      // update next bip
      state.nextBipTime += secondsPerBeat / state.denominator;

      // before precount finished:
      if (state.precountDemisemiquaver < 32) {
        state.precountDemisemiquaver++;
        return; // without further tasks
      }

      // play current notes using the session if in playback or edit mode or in battle and not user turn
      if (!this.getters.isRecordingAllowed) {
        this.dispatch(
          SESSION_STORE_LOC + ACT_sessionPlayCurrentNotes,
          getters.currentCursorPos
        );
      }

      // after the precount:
      if (state.currentDemisemiquaver + 1 == 32) {
        state.currentDemisemiquaver = 0;
        if (state.currentBar + 1 == 4) {
          state.currentBar = 0;
          this.dispatch(SESSION_STORE_LOC + ACT_sessionFinishedMelody);
          return;
        }
        state.currentBar += 1;
        return;
      }

      // check for already presssed note at start of 4bar
      if (
        state.currentBar == 0 &&
        state.currentDemisemiquaver == 0 &&
        this.getters.isRecordingAllowed &&
        this.getters.singleActiveNote
      ) {
        // console.log(this.getters.singleActiveNote);
        this.dispatch(SESSION_STORE_LOC + "switchNote", {
          pitch: this.getters.singleActiveNote,
          now: convertToPatternTime(getters.currentMusicalTime),
        });
        this.dispatch(
          INSTRUMENT_STORE_LOC + ACT_instrumentEndNote,
          this.getters.singleActiveNote
        );
        this.dispatch(
          INSTRUMENT_STORE_LOC + ACT_instrumentStartNote,
          this.getters.singleActiveNote
        );
      }

      // increase demisemi
      state.currentDemisemiquaver += 1;
    },

    /**
     * Schedule the next bip for given time
     * @param {*} time
     */
    [ACT_clockScheduleBip]({ commit, dispatch, state }, time) {
      // push the note on the queue, even if we're not playing bip sound
      // if precount is active, we do not progress currentDemisemi,
      // but progress the precount Demisemi instead
      const demisemi =
        state.precountDemisemiquaver < 32
          ? state.precountDemisemiquaver
          : state.currentDemisemiquaver;
      commit(MUT_clockBipsInQueue, {
        bip: demisemi,
        time: time,
      });
      if (demisemi % 8 == 0) {
        // sound it
        if (state.precountDemisemiquaver < 32 || state.metronomeSoundOn)
          dispatch(ACT_clockPlayMetronome, time);
        // flash it
        state.metronomeFlashActive = true;
        setTimeout(() => {
          state.metronomeFlashActive = false;
        }, 200);
      }
    },

    /**
     * Sounding the metronome at given time
     * @param {*} time
     */
    [ACT_clockPlayMetronome]({ state }, time) {
      // create an oscillator for the bip sound
      const osc = state.audioContext.createOscillator();
      const envelope = state.audioContext.createGain();
      // first accent bip is slightly higher pitch
      osc.frequency.value =
        state.currentDemisemiquaver % 32 == 0
          ? state.currentBar % 2 == 0
            ? state.currentBar % 4 == 0
              ? 2000
              : 1600
            : 1200
          : 800;
      envelope.gain.value = 1;
      envelope.gain.exponentialRampToValueAtTime(1, time + 0.001);
      envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

      osc.connect(envelope);
      envelope.connect(state.audioContext.destination);

      // only playing for a sharp period
      osc.start(time);
      osc.stop(time + 0.03);
    },

    /**
     * Advance the scheduler to the next bip
     */
    [ACT_clockAdvanceScheduler]({ state, dispatch }) {
      while (
        state.nextBipTime <
        state.audioContext.currentTime + state.scheduleAheadTime
      ) {
        dispatch(ACT_clockScheduleBip, state.nextBipTime);
        dispatch(ACT_clockNextBip);
      }
    },

    /**
     * Starts the clock
     * @returns early if the clock is already running
     */
    [ACT_clockStart]({ state, dispatch }) {
      if (state.isRunning) return;

      if (state.audioContext == null) {
        state.audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
      }

      // update mode
      if (this.state.mode == "initial")
        this.commit("mutateMode", "seed_recording");
      else if (this.state.mode == "paused") this.commit("mutateMode", "battle");

      state.isRunning = true;
      state.nextBipTime = state.audioContext.currentTime + 0.05;
      state.intervalID = setInterval(
        () => dispatch(ACT_clockAdvanceScheduler),
        state.lookahead
      );
    },

    /**
     * Stop the clock
     */
    [ACT_clockStop]({ state, dispatch }) {
      state.isRunning = false;
      // dispatch action to sessionStore to activate notes now
      this.dispatch(SESSION_STORE_LOC + ACT_sessionCloseUnfinishedNotes);
      // if precount is not over yet
      if (state.precountDemisemiquaver < 32) {
        state.precountDemisemiquaver = 0;
        state.currentBar = 0;
        state.currentDemisemiquaver = 0;
      }
      if (
        this.state.mode == "seed_recording" &&
        state.precountDemisemiquaver >= 32 &&
        this.state.sessionStore.currentPattern.length > 0
      )
        this.commit("mutateMode", "seed_edit");
      else if (
        this.state.mode == "seed_recording" &&
        (state.precountDemisemiquaver < 32 ||
          this.state.sessionStore.currentPattern.length == 0)
      ) {
        this.commit("mutateMode", "initial");
        dispatch(ACT_clockReset);
      }

      clearInterval(state.intervalID);
    },

    /**
     * Start or Stop the clock dependant on isRunning
     */
    [ACT_clockStartStop]({ state, dispatch }) {
      if (state.isRunning) {
        dispatch(ACT_clockStop);
      } else {
        dispatch(ACT_clockStart);
      }
    },

    /**
     * Reset the clock to 0
     */
    [ACT_clockReset]({ state, dispatch }) {
      dispatch(ACT_clockStop);
      // reset time pointers
      state.precountDemisemiquaver = 0;
      state.currentBar = 0;
      state.currentDemisemiquaver = 0;
      this.commit("mutateMode", "initial");
    },

    [ACT_clockResetPrecount]({ state }) {
      state.precountDemisemiquaver = 0;
    },
  },
};
