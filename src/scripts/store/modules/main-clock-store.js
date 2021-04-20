/**
 * Store module for the main clock of the app
 */
import {
  CLOCK_MUTATION_UPDATE_AUDIO_CONTEXT,
  CLOCK_MUTATION_UPDATE_BIPS_IN_QUEQUE,
  CLOCK_MUTATION_UPDATE_CURRENT_BAR,
  CLOCK_MUTATION_UPDATE_CURRENT_DEMISEMIQUAVER,
  CLOCK_MUTATION_UPDATE_CURRENT_PATTERN_IND,
  CLOCK_MUTATION_UPDATE_INTERVAL_ID,
  CLOCK_MUTATION_UPDATE_IS_RUNNING,
  CLOCK_MUTATION_UPDATE_NEXT_BIP_TIME,
  CLOCK_MUTATION_UPDATE_SOUND_ON,
} from "../mutations";
import {
  CLOCK_ACTION_NEXT_BIP,
  CLOCK_ACTION_SCHEDULE_BIP,
  CLOCK_ACTION_PLAY_METRONOME,
  CLOCK_ACTION_ADVANCE_SCHEDULER,
  CLOCK_ACTION_START,
  CLOCK_ACTION_STOP,
  CLOCK_ACTION_STARTSTOP,
  CLOCK_ACTION_RESET,
  SESSION_ACTION_GENERATE_FIRST_HALF_RESPONSE,
  SESSION_ACTION_GENERATE_SECOND_HALF_RESPONSE,
  SESSION_ACTION_CLEAR_SESSION,
  SESSION_ACTION_PLAY_CURRENT_NOTES,
  INSTRUMENT_ACTION_END_ALL_NOTES,
} from "../actions";

const SESSION_STORE_LOC = "sessionStore/";
const INSTRUMENT_STORE_LOC = "instrumentStore/";

export default {
  namespaced: true,
  state: () => ({
    audioContext: null,
    bipsInQueue: [],
    currentBar: 0,
    currentDemisemiquaver: 0,
    currentPatternInd: 0,
    denominator: 8,
    intervalID: null,
    isRunning: false,
    lookahead: 25,
    nextBipTime: 0.0,
    scheduleAheadTime: 0.1,
    soundOn: true,
    tempo: 120, // fixed value for now

    precountDemisemiquaver: 0,
  }),

  getters: {
    currentDemisemiquaver(state) {
      return state.currentDemisemiquaver;
    },
    currentBar(state) {
      return state.currentBar;
    },
    currentPatternInd(state) {
      return state.currentPatternInd;
    },
    currentMusicalTime(state) {
      return {
        pattern: state.currentPatternInd,
        bar: state.currentBar,
        demisemi: state.currentDemisemiquaver,
      };
    },
    isRunning(state) {
      return state.isRunning;
    },
    soundOn(state) {
      return state.soundOn;
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
    [CLOCK_MUTATION_UPDATE_AUDIO_CONTEXT](state, data) {
      state.audioContext = data;
    },
    [CLOCK_MUTATION_UPDATE_BIPS_IN_QUEQUE](state, data) {
      state.bipsInQueue.push(data);
    },
    [CLOCK_MUTATION_UPDATE_CURRENT_BAR](state, data) {
      state.currentBar = data;
    },
    [CLOCK_MUTATION_UPDATE_CURRENT_DEMISEMIQUAVER](state, data) {
      state.currentDemisemiquaver = data;
    },
    [CLOCK_MUTATION_UPDATE_CURRENT_PATTERN_IND](state, data) {
      state.currentPatternInd = data;
    },
    [CLOCK_MUTATION_UPDATE_INTERVAL_ID](state, data) {
      state.intervalID = data;
    },
    [CLOCK_MUTATION_UPDATE_IS_RUNNING](state, data) {
      state.isRunning = data;
    },
    [CLOCK_MUTATION_UPDATE_NEXT_BIP_TIME](state, data) {
      state.nextBipTime = data;
    },
    [CLOCK_MUTATION_UPDATE_SOUND_ON](state, data) {
      state.soundOn = data;
    },
  },

  actions: {
    /**
     * Advanced the time to the next bip (by demisemiquaver)
     * @param {*} param0
     */
    [CLOCK_ACTION_NEXT_BIP]({ commit, state }) {
      const secondsPerBeat = 60.0 / state.tempo; // as tempo is in bpm
      commit(
        CLOCK_MUTATION_UPDATE_NEXT_BIP_TIME,
        state.nextBipTime + secondsPerBeat / state.denominator
      );

      // before precount finished:
      if (state.precountDemisemiquaver < 32) {
        state.precountDemisemiquaver++;
        return; // without further tasks
      }

      // after the precount:
      if (state.currentDemisemiquaver + 1 == 32) {
        commit(CLOCK_MUTATION_UPDATE_CURRENT_DEMISEMIQUAVER, 0);

        if (state.currentBar + 1 == 4) {
          commit(CLOCK_MUTATION_UPDATE_CURRENT_BAR, 0);
          // update pattern ind in store
          commit(
            CLOCK_MUTATION_UPDATE_CURRENT_PATTERN_IND,
            state.currentPatternInd + 1
          );
          // push current pattern to session, clear current pattern
          // end of whole pattern
          this.dispatch(
            SESSION_STORE_LOC + SESSION_ACTION_GENERATE_SECOND_HALF_RESPONSE
          );
        } else {
          commit(CLOCK_MUTATION_UPDATE_CURRENT_BAR, state.currentBar + 1);
        }
        // if end of half pattern
        // add half pattern to current pattern?
        if (state.currentBar == 2) {
          // generate first half of response
          // end of half pattern
          this.dispatch(
            SESSION_STORE_LOC + SESSION_ACTION_GENERATE_FIRST_HALF_RESPONSE
          );
        }
      } else {
        commit(
          CLOCK_MUTATION_UPDATE_CURRENT_DEMISEMIQUAVER,
          state.currentDemisemiquaver + 1
        );
      }

      // dispatch action to sessionStore to activate notes now
      this.dispatch(
        SESSION_STORE_LOC + SESSION_ACTION_PLAY_CURRENT_NOTES,
        state.currentBar * 32 + state.currentDemisemiquaver
      );
    },

    /**
     * Schedule the next bip for given time
     * @param {*} time
     */
    [CLOCK_ACTION_SCHEDULE_BIP]({ commit, dispatch, state }, time) {
      // push the note on the queue, even if we're not playing sound
      // if precount is active, we do not progress currentDemisemi,
      // but progress the precount Demisemi instead
      const demisemi =
        state.precountDemisemiquaver < 32
          ? state.precountDemisemiquaver
          : state.currentDemisemiquaver;
      commit(CLOCK_MUTATION_UPDATE_BIPS_IN_QUEQUE, {
        bip: demisemi,
        time: time,
      });
      if (state.soundOn && demisemi % 8 == 0)
        dispatch(CLOCK_ACTION_PLAY_METRONOME, time);
    },

    /**
     * Sounding the metronome at given time
     * @param {*} time
     */
    [CLOCK_ACTION_PLAY_METRONOME]({ state }, time) {
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
    [CLOCK_ACTION_ADVANCE_SCHEDULER]({ state, dispatch }) {
      while (
        state.nextBipTime <
        state.audioContext.currentTime + state.scheduleAheadTime
      ) {
        dispatch(CLOCK_ACTION_SCHEDULE_BIP, state.nextBipTime);
        dispatch(CLOCK_ACTION_NEXT_BIP);
      }
    },

    /**
     * Starts the clock
     * @returns early if the clock is already running
     */
    [CLOCK_ACTION_START]({ state, dispatch, commit }) {
      if (state.isRunning) return;

      if (state.audioContext == null) {
        commit(
          CLOCK_MUTATION_UPDATE_AUDIO_CONTEXT,
          new (window.AudioContext || window.webkitAudioContext)()
        );
      }

      commit(CLOCK_MUTATION_UPDATE_IS_RUNNING, true);
      commit(
        CLOCK_MUTATION_UPDATE_NEXT_BIP_TIME,
        state.audioContext.currentTime + 0.05
      );
      commit(
        CLOCK_MUTATION_UPDATE_INTERVAL_ID,
        setInterval(
          () => dispatch(CLOCK_ACTION_ADVANCE_SCHEDULER),
          state.lookahead
        )
      );
    },

    /**
     * Stop the clock
     */
    [CLOCK_ACTION_STOP]({ state, commit }) {
      commit(CLOCK_MUTATION_UPDATE_IS_RUNNING, false);
      // dispatch action to sessionStore to activate notes now
      this.dispatch(INSTRUMENT_STORE_LOC + INSTRUMENT_ACTION_END_ALL_NOTES);
      // if precount is not over yet
      if (state.precountDemisemiquaver < 32) {
        state.precountDemisemiquaver = 0;
        commit(CLOCK_MUTATION_UPDATE_CURRENT_PATTERN_IND, 0);
        commit(CLOCK_MUTATION_UPDATE_CURRENT_BAR, 0);
        commit(CLOCK_MUTATION_UPDATE_CURRENT_DEMISEMIQUAVER, 0);
      }
      // commit(CLOCK_MUTATION_UPDATE_CURRENT_BAR, 0);
      // commit(CLOCK_MUTATION_UPDATE_CURRENT_DEMISEMIQUAVER, 0);
      clearInterval(state.intervalID);
    },

    /**
     * Start or Stop the clock dependant on isRunning
     */
    [CLOCK_ACTION_STARTSTOP]({ state, dispatch }) {
      if (state.isRunning) {
        dispatch(CLOCK_ACTION_STOP);
      } else {
        dispatch(CLOCK_ACTION_START);
      }
    },

    /**
     * Reset the clock to 0 and empty the session
     */
    [CLOCK_ACTION_RESET]({ state, commit, dispatch }) {
      dispatch(CLOCK_ACTION_STOP);
      this.dispatch(SESSION_STORE_LOC + SESSION_ACTION_CLEAR_SESSION);
      // reset time pointers
      state.precountDemisemiquaver = 0;
      commit(CLOCK_MUTATION_UPDATE_CURRENT_PATTERN_IND, 0);
      commit(CLOCK_MUTATION_UPDATE_CURRENT_BAR, 0);
      commit(CLOCK_MUTATION_UPDATE_CURRENT_DEMISEMIQUAVER, 0);
    },
  },
};
