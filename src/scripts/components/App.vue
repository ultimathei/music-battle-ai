<template>
  <div id="app" class="app">
    <Preload class="app__preload" v-if="!isPreloaded" />

    <template v-if="magentaModel">
      <div class="app__header">
        <Logo class="app-header__logo | logo" />
        <div class="app-header__controls | header-controls">
          <!-- <MidiController
            class="header-controls__control"
            @note-toggle="updateKeyboardUI"
          /> -->
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
    StartWidget,
    Footer,
  },
  computed: {
    ...mapGetters("modelStore", ["magentaModel", "isModelReady"]),
    ...mapGetters("mainClockStore", ["isRunning"]),
    ...mapGetters("sessionStore", ["userTurn", "currentPattern", "seedMelody"]),
    ...mapGetters("instrumentStore", ["rangeStart", "rangeEnd"]),
    ...mapGetters("midiStore", ["isMIDIready"]),
    isPreloaded() {
      return this.isModelReady && this.isMIDIready; // add more conditions
    },
  },
  mounted() {
    // maybe store it in local storage, so to not load it every time
    this[MODEL_ACTION_INIT_VAE](this.rangeStart, this.rangeEnd);
    this.getMIDI();
  },
  methods: {
    ...mapActions("instrumentStore", [
      INSTRUMENT_ACTION_START_NOTE,
      INSTRUMENT_ACTION_END_NOTE,
    ]),
    ...mapActions("modelStore", [MODEL_ACTION_INIT_VAE]),
    ...mapActions("midiStore", ["getMIDI"]),
    /**
     * Updating the keyboard UI to refelct changes in currently played MIDI notes.
     */
    updateKeyboardUI(payload) {
      // console.log(payload);

      // play/stop sound note for playback
      if (payload.on_message) this[INSTRUMENT_ACTION_START_NOTE](payload.note);
      else this[INSTRUMENT_ACTION_END_NOTE](payload.note);
    },
  },
};
</script>
