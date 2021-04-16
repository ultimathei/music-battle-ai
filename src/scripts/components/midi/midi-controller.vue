<template>
  <div @click="getMIDI()">Connect MIDI</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import {
  PIANO_ACTION_SET_KEY_STATE,
} from "../../store/actions";

export default {
  name: "MidiController",
  methods: {
    ...mapActions("pianoStore", [
      PIANO_ACTION_SET_KEY_STATE,
    ]),

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
     * 144 signifies a “note on” event
     * 128 typically signifies a “note off” event
     *
     * notes (pitch): 0...127
     * example: lowest note on an 88-key piano has a value of 21
     *  the highest is 108. A “middle C” is 60.
     *
     * velocity: 0..127
     * minimum velocity for note-on is 1, but
     * (note-on + velocity 0 means aslo note off)
     *
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
      // emit to parent so the dom can be updated
      const payload = {on_message: true, note: note, timestamp: new Date().getTime()}
      this.$emit('test-event', payload)
      // get current 32 unit position of metronome
      // emit note to event bus?
      this.$store.dispatch('pianoStore/'+PIANO_ACTION_SET_KEY_STATE, payload)
    },
    noteOff(note) {
      this.$emit('test-event', {on_message: false, note: note, timestamp: new Date().getTime()})
    },
  },
};
</script>
