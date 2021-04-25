<template>
  <div id="app" class="app">
    <Preload class="app__preload" v-if="!isModelReady" />

    <template v-if="magentaModel">
      <div class="app__header">
        <Logo class="app-header__logo | logo" />
        <div class="app-header__controls | header-controls">
          <MidiController
            class="header-controls__control"
            @note-toggle="updateKeyboardUI"
          />
          <Controls class="header-controls__control" />
        </div>
      </div>
      <div class="app__body | app-body">       
        
        <div class="app-body__instrument | instrument">
          <div class="instrument__container | instrument-container">
            <Piano class="instrument-container__content" ref="piano" />
          </div>
        </div>


        <div class="app-body__music-sheet-wrap">
          <StartWidget
            class="app-body__start-widget"
            v-if="currentPattern.length == 0 && !seedMelody && !isRunning"
          />
          <MusicSheet class="app-body__music-sheet" />
        </div>
        <Sequencer class="app-body__pattern-sequence" />
        <!-- <Sequencer2 class="app__pattern-sequence" /> -->
      </div>
      <Footer class="app__footer" />
    </template>
  </div>
</template>

<script>
import Logo from "./graphics/logo.svg";
import Controls from "./controls/controls.vue";
import MidiController from "./midi/midi-controller.vue";
import MusicSheet from "./music-sheet/music-sheet.vue";
import Preload from "./preload/preload.vue";
import Piano from "./piano/Piano.vue";
import Sequencer from "./music-sheet/sequencer.vue";
import Sequencer2 from "./music-sheet/sequencer2.vue";
import StartWidget from "./start-widget/start-widget.vue";
import Footer from "./footer/footer.vue";

import { mapActions, mapGetters } from "vuex";
import {
  INSTRUMENT_ACTION_START_NOTE,
  INSTRUMENT_ACTION_END_NOTE,
  MODEL_ACTION_INIT_VAE,
} from "../store/actions";

export default {
  name: "app",
  components: {
    Logo,
    Controls,
    MidiController,
    MusicSheet,
    Piano,
    Preload,
    Sequencer,
    Sequencer2,
    StartWidget,
    Footer,
  },
  computed: {
    ...mapGetters("modelStore", ["magentaModel", "isModelReady"]),
    ...mapGetters("mainClockStore", ["isRunning"]),
    ...mapGetters("sessionStore", ["currentPattern", "seedMelody"]),
  },
  mounted() {
    // maybe store it in local storage, so to not load it every time
    this[MODEL_ACTION_INIT_VAE]();
  },
  methods: {
    ...mapActions("instrumentStore", [
      INSTRUMENT_ACTION_START_NOTE,
      INSTRUMENT_ACTION_END_NOTE,
    ]),
    ...mapActions("modelStore", [MODEL_ACTION_INIT_VAE]),
    /**
     * Updating the keyboard UI to refelct changes in currently played MIDI notes.
     */
    updateKeyboardUI(payload) {
      // console.log(payload);
      let pressed_key_DOM = this.$el.querySelector(
        `[data-note-index='${payload.note}']`
      );
      if (pressed_key_DOM) {
        pressed_key_DOM.setAttribute(
          "data-piano-key-pressed",
          payload.on_message
        );

        // play/stop sound note for playback
        if (payload.on_message)
          this[INSTRUMENT_ACTION_START_NOTE](payload.note);
        else this[INSTRUMENT_ACTION_END_NOTE](payload.note);
      }
    },
  },
};
</script>
