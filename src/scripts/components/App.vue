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

    <div class="app__music-sheet-wrap">
      <div class="app__music-sheet | music-sheet">
        <div class="music-sheet__side">
          <div class="music-sheet__header"></div>
          <div class="music-sheet__row" v-for="r in array" :key="`row-${r}`">
            {{ getNoteName(r, 0) }}
          </div>
        </div>
        <div class="music-sheet__body">
          <div class="music-sheet__header">
            <div
              class="music-sheet__column"
              v-for="c in 128"
              :key="`header-marker-${c}`"
              :data-demisemiquaver-index="c"
            ></div>
          </div>
          <div class="music-sheet__content">
            <div class="music-sheet__row" v-for="r in 12" :key="`row-${r}`">
              <div
                class="music-sheet__column"
                v-for="c in 128"
                :key="`row-${c}`"
                :data-demisemiquaver-index="c"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Piano class="app__piano" ref="piano" />

    <p class="app__footer">
      created by Mate Krisztian for the final year project QMUL @ 2021
    </p>
  </div>
</template>

<script>
import Metronome from "./metronome/metronome.vue";
import MidiController from "./midi/midi-controller.vue";
import Piano from "./piano/Piano.vue";
import Logo from "./graphics/logo.svg";

export default {
  name: "app",
  components: {
    Logo,
    Metronome,
    MidiController,
    Piano,
  },
  data() {
    return {
      array: Array.from({ length: 12 }, (x, i) => i).reverse(),
    };
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

    getNoteName(noteIndex, octaveIndex) {
      switch (noteIndex) {
        case 0:
          return "C" + octaveIndex;
        case 1:
          return "C#" + octaveIndex;
        case 2:
          return "D" + octaveIndex;
        case 3:
          return "D#" + octaveIndex;
        case 4:
          return "E" + octaveIndex;
        case 5:
          return "F" + octaveIndex;
        case 6:
          return "F#" + octaveIndex;
        case 7:
          return "G" + octaveIndex;
        case 8:
          return "G#" + octaveIndex;
        case 9:
          return "A" + octaveIndex;
        case 10:
          return "A#" + octaveIndex;
        case 11:
          return "B" + octaveIndex;
        case 12:
          return "C" + octaveIndex;
        default:
          return "missing";
      }
    },
  },
};
</script>
