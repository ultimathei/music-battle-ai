/**
 * Store module for the MIDI communication
 */
// import {
// } from "../actions";

export default {
  namespaced: true,
  state: () => ({
    midiAccess: null,
    midiStatusMsg: "Loading web MIDI..",
    // outputs: null,
    rangeStart: 60, // from instrument store?
    rangeEnd: 84, // from instrument store?
  }),

  getters: {
    midiStatusMsg(state) {
      return state.midiStatusMsg;
    },
    midiAccess(state) {
      return state.midiAccess;
    },
    inputs(state) {
      return state.midiAccess.inputs;
    },
    isMIDIready(state) {
      return (
        state.midiAccess &&
        state.midiAccess.inputs &&
        state.midiAccess.inputs.size > 0
      );
    },
  },

  mutations: {
    // using the ES2015 computed property name feature
    // to use a constant as the function name
  },

  actions: {
    // [INSTRUMENT_ACTION_START_NOTE]({getters}, note) {
    //   getters.synth.triggerAttack(getNoteName(note));
    // },
    async getMIDI({ state, getters, dispatch }) {
      if (navigator.requestMIDIAccess) {
        console.log("This browser supports WebMIDI!");
        const midiAccess = await navigator.requestMIDIAccess();
        if (midiAccess.inputs != null && midiAccess.inputs.size > 0)
          dispatch("onMIDISuccess", midiAccess);
        else dispatch("onMIDIFailure");
      } else {
        console.log("WebMIDI is not supported in this browser.");
        state.midiStatusMsg =
          "WebMIDI is not supported in this browser. Please use a Google Chrome.";
      }
    },

    onMIDIFailure({ state }) {
      console.log("Could not access your MIDI devices.");
      state.midiStatusMsg = "Could not access your MIDI devices.";
    },

    onMIDISuccess({ state, dispatch }, midiAccess) {
      console.log("MIDI successfully connected", midiAccess);
      state.midiAccess = midiAccess;
      state.midiStatusMsg = "MIDI successfully connected";
      // state.outputs = midiAccess.outputs

      for (let input of state.midiAccess.inputs.values())
        input.onmidimessage = (msg) => dispatch("getMIDIMessage", msg);
    },

    getMIDIMessage({ state }, midiMsg) {
      // early exit if its not the user's turn
      // if (this.isRunning && !this.userTurn) return;

      const command = midiMsg.data[0];
      // notes (pitch): 0...127
      // example: lowest note on an 88-key piano has a value of 21
      // the highest is 108. A “middle C” is 60.
      const note = midiMsg.data[1];
      // velocity: 0..127
      // minimum velocity for note-on is 1
      // velocity might not be present for noteoff
      const velocity = midiMsg.data.length > 2 ? midiMsg.data[2] : 0;

      // command types we are interested in:
      // 144 marks a “note on” event
      // 128 marks a “note off” event (or 144 with 0 velocity)
      switch (command) {
        // noteOn
        case 144:
          if (note < state.rangeStart || note > state.rangeEnd) {
            return;
          } else if (velocity > 0) {
            this.dispatch("noteTrigger", {
              note: note,
              on_message: true,
              velocity: velocity,
            });
          } else {
            this.dispatch("noteTrigger", {
              note: note,
              on_message: false,
              velocity: velocity,
            });
          }
          break;
        // noteOff
        case 128:
          this.dispatch("noteTrigger", {
            note: note,
            on_message: false,
            velocity: velocity,
          });
          break;
        // expand switch to handle other command types
      }
    },
  },
};
