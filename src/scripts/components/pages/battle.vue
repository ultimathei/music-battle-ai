<template>
  <div :class="'| page-battle'">
    <div class="page-battle__instrument | instrument">
      <div class="instrument__container | instrument-container">
        <Piano class="instrument-container__content" ref="piano" />
      </div>
    </div>

    <div class="page-battle__music-sheet-wrap">
      <StartWidget class="page-battle__info-widget" v-if="isStartWidgetVisible" />
      <MusicSheet class="page-battle__music-sheet" />
    </div>
    <Sequencer class="page-battle__pattern-sequence" />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import MusicSheet from "../music-sheet/music-sheet.vue";
import Piano from "../piano/Piano.vue";
import Sequencer from "../music-sheet/sequencer.vue";
import StartWidget from "../info-widget/info-widget.vue";

export default {
  name: "BattlePage",
  components: {
    MusicSheet,
    Piano,
    Sequencer,
    StartWidget,
  },
  computed: {
    ...mapGetters("mainClockStore", ["isRunning"]),
    ...mapGetters("sessionStore", ["deleteInitiated"]),
    ...mapGetters(["mode"]),

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
    //
  },
};
</script>
