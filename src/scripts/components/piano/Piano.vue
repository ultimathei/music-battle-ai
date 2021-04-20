<template>
  <div
    :class="['|', 'piano']"
    :style="sizeStyle"
    :data-input-disabled="isInputDisabled"
  >
    <div class="piano__blocked | blocked-message" v-if="isInputDisabled">
      <div class="blocked-message__figure">
        <RobotIcon />
        <div class="blocked-message__countback" :data-active="countBack <= 4">
          {{ countBack }}
        </div>
      </div>
    </div>
    <div class="piano__content">
      <div class="piano__side-panel">
        <div class="piano__side-panel-bottom"></div>
      </div>
      <div class="piano__main">
        <div class="piano__top-panel"></div>
        <piano-keyboard class="piano__keyboard" />
      </div>
    </div>
  </div>
</template>

<script>
// import * as Tone from 'tone';
import PianoKeyboard from "./PianoKeyboard.vue";
import { mapGetters } from "vuex";
import RobotIcon from "../graphics/robot.svg";
import { convertToPatternTime } from "../../utils/utils";

// import {
//   PIANO_ACTION_SET_HEIGHT,
//   PIANO_ACTION_SET_KEYSIZE,
//   PIANO_ACTION_SET_OCTAVE_COUNT,
//   PIANO_ACTION_SET_SCALE,
//   PIANO_ACTION_SET_SIDE_PANEL_WIDTH,
//   PIANO_ACTION_SET_WIDTH,
// } from "../../store/actions";

export default {
  components: {
    PianoKeyboard,
    RobotIcon,
  },
  name: "Piano",
  computed: {
    ...mapGetters("sessionStore", ["userTurn"]),
    ...mapGetters("mainClockStore", ["currentMusicalTime", "isRunning"]),
    ...mapGetters("pianoStore", [
      "aspectRatio",
      "blackKeySize",
      "height",
      "keySize",
      "octaveCount",
      "scale",
      "sidePanelWidth",
      "width",
    ]),
    isInputDisabled() {
      return this.isRunning && !this.userTurn;
    },
    countBack() {
      return 16 - Math.floor(convertToPatternTime(this.currentMusicalTime) / 8);
    },
    // local computed
    sizeStyle() {
      return {
        height: `${this.height}px`,
        width: `${this.width}px`,
        // paddingTop: `${this.aspectRatio * 100}%`,
      };
    },
  },
  // methods: {
  //   ...mapActions("pianoStore", [
  //     PIANO_ACTION_SET_HEIGHT,
  //     PIANO_ACTION_SET_KEYSIZE,
  //     PIANO_ACTION_SET_OCTAVE_COUNT,
  //     PIANO_ACTION_SET_SCALE,
  //     PIANO_ACTION_SET_SIDE_PANEL_WIDTH,
  //     PIANO_ACTION_SET_WIDTH,
  //   ]),
  // },
};
</script>
