<template>
  <div id="app" class="app">
    <div class="app__header">
      <Logo class="app-header__logo | logo" />
      <div class="app-header__controls | header-controls">
        <MidiController
          class="header-controls__control"
          @note-toggle="updateKeyboardUI"
        />
        <Metronome class="header-controls__control" />
      </div>
    </div>
    <MusicSheet class="app__music-sheet-wrap" />
    <Piano class="app__piano" ref="piano" />

    <p class="app__footer">
      created by Mate Krisztian for the final year project QMUL @ 2021
    </p>
  </div>
</template>

<script>
import Logo from "./graphics/logo.svg";
import Metronome from "./metronome/metronome.vue";
import MidiController from "./midi/midi-controller.vue";
import MusicSheet from "./music-sheet/music-sheet.vue";
import Piano from "./piano/Piano.vue";

export default {
  name: "app",
  components: {
    Logo,
    Metronome,
    MidiController,
    MusicSheet,
    Piano,
  },
  methods: {
    /**
     * Updating the keyboard UI to refelct changes in currently played MIDI notes.
     */
    updateKeyboardUI(payload) {
      // console.log(payload);
      let pressed_key_DOM = this.$el.querySelector(
        `[data-note-index='${payload.note}']`
      );
      if (pressed_key_DOM)
        pressed_key_DOM.setAttribute(
          "data-piano-key-pressed",
          payload.on_message
        );
    },
  },
};
</script>
