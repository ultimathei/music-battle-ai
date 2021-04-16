<template>
  <div id="app" class="app">
    <h1 class="app__header">Music Battle Ai v.1.0</h1>
    <midi-controller class="app__testbtn" @test-event="test" />
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
import MidiController from "./midi/midi-controller.vue";

export default {
  name: "app",
  components: {
    Metronome,
    MidiController,
    Piano,
  },
  methods: {
    test(payload) {
      // console.log(payload);
      let pressed_key_DOM = this.$el.querySelector(
        `[data-note-index='${payload.note}']`
      );
      if (pressed_key_DOM)
        pressed_key_DOM.setAttribute("data-piano-key-pressed", payload.on_message);
    },
  },
};
</script>
