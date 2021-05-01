<template>
  <div class="app">
    <Preload class="app__preload" v-if="!isPreloaded" />

    <template v-if="magentaModel">
      <div class="app__header">
        <Logo class="app-header__logo | logo" />
        <div class="app-header__controls">
          <div class="metronome__details">
            {{ currentBar + 1 }} /
            {{ Math.floor(currentDemisemiquaver / 8) + 1 }}/4
          </div>
          <div
            class="metronome__flash"
            :data-active="metronomeFlashActive"
            ref="metronome_flash"
          ></div>
          <MetronomeIcon
            class="metronome__button"
            @click="switchMetronome"
            :data-active="metronomeSoundOn"
          />
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
            class="app-body__info-widget"
            v-if="isStartWidgetVisible"
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
import MetronomeIcon from "./graphics/metronome.svg";
import Controls from "./controls/controls.vue";
import MidiController from "./midi/midi-controller.vue";
import MusicSheet from "./music-sheet/music-sheet.vue";
import Preload from "./preload/preload.vue";
import Piano from "./piano/Piano.vue";
import Sequencer from "./music-sheet/sequencer.vue";
import StartWidget from "./info-widget/info-widget.vue";
import Footer from "./footer/footer.vue";

import { mapActions, mapGetters, mapMutations } from "vuex";
import {
  INSTRUMENT_ACTION_START_NOTE,
  INSTRUMENT_ACTION_END_NOTE,
  MODEL_ACTION_INIT_VAE,
} from "../store/actions";
import { CLOCK_MUTATION_UPDATE_SOUND_ON } from "../store/mutations";

export default {
  name: "app",
  components: {
    Logo,
    Controls,
    MidiController,
    MetronomeIcon,
    MusicSheet,
    Piano,
    Preload,
    Sequencer,
    StartWidget,
    Footer,
  },
  computed: {
    ...mapGetters("modelStore", ["magentaModel", "isModelReady"]),
    ...mapGetters("mainClockStore", [
      "isRunning",
      "currentBar",
      "currentDemisemiquaver",
      "metronomeSoundOn",
      "metronomeFlashActive",
    ]),
    ...mapGetters("sessionStore", [
      "userTurn",
      "currentPattern",
      "seedMelody",
      "deleteInitiated",
    ]),
    ...mapGetters("instrumentStore", ["rangeStart", "rangeEnd"]),
    ...mapGetters("midiStore", ["isMIDIready"]),
    ...mapGetters(["mode"]),
    isPreloaded() {
      return this.isModelReady && this.isMIDIready; // add more conditions
    },
    isStartWidgetVisible() {
      return (
        this.deleteInitiated ||
        (!this.isRunning &&
          this.mode != "seed_recording" &&
          this.mode != "seed_edit")
        // this.currentPattern.length == 0 && !this.seedMelody
      );
    },
  },
  mounted() {
    // maybe store it in local storage, so to not load it every time
    // console.log(this.rangeStart, this.rangeEnd);
    this.getMIDI();
    this[MODEL_ACTION_INIT_VAE](this.rangeStart, this.rangeEnd);
  },
  methods: {
    ...mapActions("instrumentStore", [
      INSTRUMENT_ACTION_START_NOTE,
      INSTRUMENT_ACTION_END_NOTE,
    ]),
    ...mapActions("modelStore", [MODEL_ACTION_INIT_VAE]),
    ...mapActions("midiStore", ["getMIDI"]),
    ...mapMutations("mainClockStore", [CLOCK_MUTATION_UPDATE_SOUND_ON]),

    switchMetronome() {
      this[CLOCK_MUTATION_UPDATE_SOUND_ON](!this.metronomeSoundOn);
    },
  },
};
</script>
