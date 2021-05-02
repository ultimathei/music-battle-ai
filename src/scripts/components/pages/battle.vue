<template>
  <div :class="'| app-body'">
    <div class="app-body__instrument | instrument">
      <div class="instrument__container | instrument-container">
        <Piano class="instrument-container__content" ref="piano" />
      </div>
    </div>

    <div class="app-body__music-sheet-wrap">
      <StartWidget class="app-body__info-widget" v-if="isStartWidgetVisible" />
      <MusicSheet class="app-body__music-sheet" />
    </div>
    <Sequencer class="app-body__pattern-sequence" />
  </div>
</template>

<script>
import MusicSheet from "../music-sheet/music-sheet.vue";
import Piano from "../piano/Piano.vue";
import PlayIcon from "../graphics/play.svg";
import UserIcon from "../graphics/user.svg";
import Sequencer from "../music-sheet/sequencer.vue";
import StartWidget from "../info-widget/info-widget.vue";
import { mapGetters, mapMutations } from "vuex";
import { MUT_clockMetronomeSoundOn } from "../../store/mutations";

export default {
  name: "BattlePage",
  components: {
    Piano,
    StartWidget,
    MusicSheet,
    Sequencer,
    UserIcon,
    PlayIcon,
  },
  computed: {
    ...mapGetters(["user", "mode", "isMenuOpen", "currentPageOpen"]),
    ...mapGetters("modelStore", ["magentaModel", "isModelReady"]),
    ...mapGetters("mainClockStore", [
      "isRunning",
      "currentBar",
      "currentDemisemiquaver",
      "metronomeSoundOn",
      "metronomeFlashActive",
      "audioContext",
    ]),
    ...mapGetters("sessionStore", ["deleteInitiated"]),
    ...mapGetters("instrumentStore", ["rangeStart", "rangeEnd"]),
    ...mapGetters("midiStore", ["isMIDIready"]),

    // local computed
    isStartWidgetVisible() {
      return (
        this.deleteInitiated ||
        (!this.isRunning &&
          this.mode != "seed_recording" &&
          this.mode != "seed_edit")
      );
    },
  },
  methods: {
    ...mapMutations("mainClockStore", [MUT_clockMetronomeSoundOn]),
  },
};
</script>
