<template>
  <div :class="['|', 'piano']" :style="sizeStyle">
    <div class="piano__content">
      <div class="piano__side-panel"></div>
      <div class="piano__main">
        <div class="piano__top-panel">{{ aspectRatio }}</div>
        <piano-keyboard class="piano__keyboard" />
      </div>
    </div>
  </div>
</template>

<script>
import PianoKeyboard from "./PianoKeyboard.vue";
import { mapState, mapActions } from "vuex";
import {
  PIANO_ACTION_SET_HEIGHT,
  PIANO_ACTION_SET_KEYSIZE,
  PIANO_ACTION_SET_OCTAVE_COUNT,
  PIANO_ACTION_SET_SCALE,
  PIANO_ACTION_SET_SIDE_PANEL_WIDTH,
  PIANO_ACTION_SET_WIDTH,
} from "../../store/actions";

export default {
  components: {
    PianoKeyboard,
  },
  name: "Piano",
  data: function () {
    return {
      // local data
    };
  },
  computed: {
    sizeStyle: function () {
      return {
        height: `${this.height}px`,
        width: `${this.width}px`,
        // paddingTop: `${this.aspectRatio * 100}%`,
      };
    },
    ...mapState("pianoStore", [
      "aspectRatio",
      "blackKeySize",
      "height",
      "keySize",
      "octaveCount",
      "scale",
      "sidePanelWidth",
      "width",
    ]),
  },
  methods: {
    ...mapActions("pianoStore", [
      PIANO_ACTION_SET_HEIGHT,
      PIANO_ACTION_SET_KEYSIZE,
      PIANO_ACTION_SET_OCTAVE_COUNT,
      PIANO_ACTION_SET_SCALE,
      PIANO_ACTION_SET_SIDE_PANEL_WIDTH,
      PIANO_ACTION_SET_WIDTH,
    ]),
  },
};
</script>
