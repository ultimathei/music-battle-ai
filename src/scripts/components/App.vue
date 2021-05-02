<template>
  <div class="app">
    <Preload class="app__preload" v-if="!isPreloaded" />

    <template v-if="magentaModel">
      <div class="app__header | app-header">
        <div class="app-header__menu" @click="mutateIsMenuOpen(!isMenuOpen)">
          <MenuIcon v-if="!isMenuOpen"/>
          <MenuIconCloser v-else/>
        </div>
        <div class="app-header__logo | logo">
          <Logo />
        </div>
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

      <div class="app__menu | menu" v-if="isMenuOpen">
        <div class="menu__item">Battleground</div>
        <div class="menu__item">Profile & settings</div>
        <div class="menu__item">My saved battles</div>
        <div class="menu__item">Scoreboard</div>
        <div class="menu__item">Logout</div>
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
import Controls from "./controls/controls.vue";
import Footer from "./footer/footer.vue";
import Logo from "./graphics/logo.svg";
import MenuIcon from "./graphics/menu.svg";
// import MenuIconCloser from "./graphics/menu_close_1.svg";
import MenuIconCloser from "./graphics/menu_close_2.svg";
import MetronomeIcon from "./graphics/metronome.svg";
import MidiController from "./midi/midi-controller.vue";
import MusicSheet from "./music-sheet/music-sheet.vue";
import Piano from "./piano/Piano.vue";
import Preload from "./preload/preload.vue";
import Sequencer from "./music-sheet/sequencer.vue";
import StartWidget from "./info-widget/info-widget.vue";

import { mapActions, mapGetters, mapMutations } from "vuex";
import {
  ACT_instrumentStartNote,
  ACT_instrumentEndNote,
  ACT_modelInitVae,
} from "../store/actions";
import { MUT_clockMetronomeSoundOn } from "../store/mutations";

export default {
  name: "app",
  components: {
    Controls,
    Footer,
    Logo,
    MenuIcon,
    MenuIconCloser,
    MetronomeIcon,
    MidiController,
    MusicSheet,
    Piano,
    Preload,
    Sequencer,
    StartWidget,
  },
  computed: {
    ...mapGetters(["mode", "isMenuOpen"]),
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
    this[ACT_modelInitVae](this.rangeStart, this.rangeEnd);
  },
  methods: {
    ...mapActions("instrumentStore", [
      ACT_instrumentStartNote,
      ACT_instrumentEndNote,
    ]),
    ...mapActions("modelStore", [ACT_modelInitVae]),
    ...mapActions("midiStore", ["getMIDI"]),
    ...mapMutations("mainClockStore", [MUT_clockMetronomeSoundOn]),
    ...mapMutations(["mutateIsMenuOpen"]),

    switchMetronome() {
      this[MUT_clockMetronomeSoundOn](!this.metronomeSoundOn);
    },
  },
};
</script>
