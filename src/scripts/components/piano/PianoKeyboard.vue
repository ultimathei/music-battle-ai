<template>
  <div :class="['|', 'piano-keyboard']">
    <div class="piano-keyboard__white-keys">
      <piano-white-key
        v-for="n in whiteKeys"
        :key="n"
        class="piano-keyboard__white-key"
        :data-note-index="n"
        :data-piano-key-pressed="singleActiveNote == n"
        :style="whiteKeyStyle"
      ></piano-white-key>
    </div>
    <div class="piano-keyboard__black-keys">
      <piano-black-key
        v-for="n in blackKeys"
        :key="`black-key-${n}`"
        class="piano-keyboard__black-key"
        :data-piano-black-key-index="n"
        :data-note-index="n"
        :data-piano-key-pressed="singleActiveNote == n"
        :style="blackKeyStyle(n)"
      />
    </div>
  </div>
</template>

<script>
import PianoWhiteKey from "./PianoWhiteKey.vue";
import PianoBlackKey from "./PianoBlackKey.vue";
import { mapGetters } from "vuex";

export default {
  components: { PianoWhiteKey, PianoBlackKey },
  name: "PianoKeyboard",
  computed: {
    ...mapGetters("instrumentStore", ["rangeStart", "rangeEnd"]),
    ...mapGetters(["currentlyPressedNotes", "singleActiveNote"]),
    keyArray() {
      return [...Array(this.rangeEnd - this.rangeStart + 1).keys()].map(
        (x) => x + this.rangeStart
      );
    },
    whiteKeys() {
      return this.keyArray.filter((keyIndex) => {
        let remainder = keyIndex % 12;
        return [0, 2, 4, 5, 7, 9, 11].includes(remainder);
      });
    },
    blackKeys() {
      return this.keyArray.filter((keyIndex) => {
        let remainder = keyIndex % 12;
        return [1, 3, 6, 8, 10].includes(remainder);
      });
    },
    whiteKeyStyle() {
      return { width: `${100 / this.whiteKeys.length}%` };
    },
  },
  methods: {
    blackKeyStyle(n) {
      return {
        width: `${(100 / this.whiteKeys.length) * 0.5}%`,
        marginLeft: `${(100 / this.whiteKeys.length) * -0.25}%`,
        left: `${(100 / this.whiteKeys.length) * this.getLeftPos(n)}%`,
      };
    },
    getLeftPos(ind) {
      let blackKeyMap = {
        1: 1,
        3: 2,
        6: 4,
        8: 5,
        10: 6,
      };
      let multiplier = Math.floor(ind / 12) - 5;
      // 7 white keys in an octave
      let pos = multiplier * 7 + blackKeyMap[ind % 12];
      return pos;
    },
  },
};
</script>
