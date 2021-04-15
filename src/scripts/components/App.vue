<template>
  <div id="app" class="app">
    <!-- <test></test> -->
    <h1 class="app__header">Music Battle Ai v.1.0</h1>
    <div class="app__testbtn" @click="getMIDI()">Click me for MIDI</div>
    <metronome class="app__testbtn" />
    <piano class="app__piano" ref="piano"></piano>
    <p class="app__footer">
      created by Mate Krisztian for the final year project QMUL @ 2021
    </p>
  </div>
</template>

<script>
// import test from "./test/Test.vue"
import Piano from "./piano/Piano.vue";
import Metronome from "./metronome/metronome.vue";

export default {
  components: {
    // test,
    Piano,
    Metronome,
  },
  name: "app",

  methods: {
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
      console.log("note on: ", note);
      let pressed_key_DOM = this.$el.querySelector(
        `[data-note-index='${note}']`
      );
      // console.log(pressed_key_DOM);
      if (pressed_key_DOM)
        pressed_key_DOM.setAttribute("data-piano-key-pressed", "true");
    },
    noteOff(note) {
      console.log("note off: ", note);
      let pressed_key_DOM = this.$el.querySelector(
        `[data-note-index='${note}']`
      );
      if (pressed_key_DOM)
        pressed_key_DOM.setAttribute("data-piano-key-pressed", "false");
    },
  },
};
</script>
