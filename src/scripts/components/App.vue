<template>
  <div class="app">
    <Preload class="app__preload" v-if="!isPreloaded" />

    <template v-if="magentaModel">
      <div class="app__header | app-header">
        <div class="app-header__menu" @click="switchMenu">
          <MenuIcon v-if="!isMenuOpen" />
          <MenuIconCloser v-else />
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
        <div
          class="menu__item"
          @click="goToPage('battle')"
          :data-active="currentPageOpen == 'battle'"
        >
          Battleground
        </div>
        <div
          class="menu__item"
          @click="goToPage('profile')"
          :data-active="currentPageOpen == 'profile'"
        >
          Profile & settings
        </div>
        <div
          class="menu__item"
          @click="goToPage('battles')"
          :data-active="currentPageOpen == 'battles'"
        >
          My saved battles
        </div>
        <div
          class="menu__item"
          @click="goToPage('scoreboard')"
          :data-active="currentPageOpen == 'scoreboard'"
        >
          Scoreboard
        </div>
        <div class="menu__item" @click="goToPage('logout')">Logout</div>
      </div>

      <div class="app__page | page-profile" v-if="currentPageOpen == 'profile'">
        <div class="page-profile__item">
          <div class="page-profile__item-avatar">
            <div class="page-profile__item-avatar-photo">
              <UserIcon />
            </div>
          </div>
        </div>
        <div class="page-profile__item">
          <div class="page-profile__item-key">Name</div>
          <div class="page-profile__item-value">Mate</div>
        </div>
        <div class="page-profile__item">
          <div class="page-profile__item-key">Email</div>
          <div class="page-profile__item-value">
            krisztian.mate.design@gmail.com
          </div>
        </div>
        <div class="page-profile__item">
          <div class="page-profile__item-key">Member since</div>
          <div class="page-profile__item-value">01/12/21</div>
        </div>
        <div class="page-profile__item">
          <div class="page-profile__item-key">Level</div>
          <div class="page-profile__item-value">PRO</div>
        </div>
        <div class="page-profile__item">
          <div class="page-profile__item-key">All time score</div>
          <div class="page-profile__item-value">100009999</div>
        </div>
        <div class="page-profile__item">
          <div class="page-profile__item-button">
            <span>Request password change</span>
          </div>
        </div>
      </div>

      <div
        class="app__page | page-battles"
        v-if="currentPageOpen == 'battles'"
      ></div>
      <div
        class="app__page | page-scoreboard"
        v-if="currentPageOpen == 'scoreboard'"
      ></div>

      <div class="app__body | app-body" v-if="currentPageOpen == 'battle'">
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
  ACT_clockStop,
} from "../store/actions";

import {
  MUT_clockMetronomeSoundOn,
  MUT_clockAudioContext,
} from "../store/mutations";

import UserIcon from "./graphics/user.svg";

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
    UserIcon,
  },
  computed: {
    ...mapGetters(["mode", "isMenuOpen", "currentPageOpen"]),
    ...mapGetters("modelStore", ["magentaModel", "isModelReady"]),
    ...mapGetters("mainClockStore", [
      "isRunning",
      "currentBar",
      "currentDemisemiquaver",
      "metronomeSoundOn",
      "metronomeFlashActive",
      "audioContext",
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
    ...mapActions("mainClockStore", [ACT_clockStop]),
    ...mapMutations("mainClockStore", [
      MUT_clockMetronomeSoundOn,
      MUT_clockAudioContext,
    ]),
    ...mapMutations("midiStore", ["removeMidiAccess"]),
    ...mapMutations(["mutateIsMenuOpen", "mutateCurrentPageOpen"]),

    switchMetronome() {
      this[MUT_clockMetronomeSoundOn](!this.metronomeSoundOn);
    },

    switchMenu() {
      if (this.isMenuOpen) {
        this.mutateIsMenuOpen(false);
      } else {
        // stop playback
        this[ACT_clockStop]();
        this.mutateIsMenuOpen(true);
      }
    },

    goToPage(name) {
      if(name == "logout"){
          this[MUT_clockAudioContext](null);
          this.removeMidiAccess();
          this.mutateIsMenuOpen(false);
          this.mutateCurrentPageOpen("battle");
          this.$router.push("/");
      }else{
          this[MUT_clockAudioContext](null);
          this.mutateCurrentPageOpen(name);
          this.mutateIsMenuOpen(false);
      }
    },
  },
};
</script>
