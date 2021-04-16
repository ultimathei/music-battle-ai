<template>
  <div @click="getMIDI()">Connect MIDI</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import {
  PIANO_ACTION_SET_KEY_STATE,
  CLOCK_ACTION_UPDATE_CURRENT_32_UNIT,
} from "../../store/actions";

export default {
  name: "MidiController",
  methods: {
    // mapping the getters not state to limit ability of modifications
    // to actions
    ...mapGetters("mainClockStore", ["current32unit"]),
    ...mapActions("mainClockStore", [CLOCK_ACTION_UPDATE_CURRENT_32_UNIT]),
    ...mapActions("pianoStore", [PIANO_ACTION_SET_KEY_STATE]),

    getMIDI() {
      if (navigator.requestMIDIAccess) {
        console.log("This browser supports WebMIDI!");
      } else {
        console.log("WebMIDI is not supported in this browser.");
      }

      navigator
        .requestMIDIAccess()
        .then(this.onMIDISuccess, this.onMIDIFailure);
    },
    /**
     * MIDI connection failure handler
     */
    onMIDIFailure() {
      console.log("Could not access your MIDI devices.");
    },
    /**
     * On successful MIDI connection, we set up event listener for inputs
     */
    onMIDISuccess(midiAccess) {
      console.log("MIDI successfully connected", midiAccess);
      const inputs = midiAccess.inputs;
      console.log("inputs: ", inputs);
      // const outputs = midiAccess.outputs
      // console.log('outputs: ', outputs)

      for (let input of midiAccess.inputs.values())
        input.onmidimessage = this.getMIDIMessage;
    },
    /**
     * command:
     *    144 marks a “note on” event
     *    128 marks a “note off” event (or 144 with 0 velocity)
     *
     * notes (pitch): 0...127
     *    example: lowest note on an 88-key piano has a value of 21
     *    the highest is 108. A “middle C” is 60.
     *
     * velocity: 0..127
     *    minimum velocity for note-on is 1
     */
    getMIDIMessage(midiMsg) {
      // console.log(midiMsg);
      const command = midiMsg.data[0];
      const note = midiMsg.data[1];
      // velocity might not be present for noteoff command
      const velocity = midiMsg.data.length > 2 ? midiMsg.data[2] : 0;

      switch (command) {
        // noteOn
        case 144:
          if (velocity > 0) {
            this.noteOn(note, velocity);
          } else {
            this.noteOff(note);
          }
          break;
        // noteOff
        case 128:
          this.noteOff(note);
          break;
        // expand switch to handle other command types
      }
    },
    noteOn(note) {
      const payload = {
        on_message: true,
        note: note,
        timestamp: new Date().getTime(),
      };
      // emit to parent so the dom can be updated
      this.$emit("note-toggle", payload);
      // get current 32 unit position of metronome
      // console.log(note)
      console.log(this.current32unit())
    },
    noteOff(note) {
      this.$emit("note-toggle", {
        on_message: false,
        note: note,
        timestamp: new Date().getTime(),
      });
    },
  },
};
</script>
