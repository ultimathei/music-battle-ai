<template>
  <div>
    <div class="app__music-sheet | music-sheet">
      <div class="music-sheet__side">
        <div class="music-sheet__header"></div>
        <div class="music-sheet__row" v-for="r in array" :key="`row-${r}`">
          {{ getNoteName(r, 0) }}
        </div>
      </div>
      <div class="music-sheet__body">
        <div class="music-sheet__cursor" :style="cursorLeftPosStyle"></div>
        <div class="music-sheet__header">
          <div
            class="music-sheet__column"
            v-for="c in 128"
            :key="`header-marker-${c}`"
            :data-demisemiquaver-index="c"
          ></div>
        </div>
        <div class="music-sheet__content">
          <div class="music-sheet__row" v-for="r in 12" :key="`row-${r}`">
            <div
              class="music-sheet__column"
              v-for="c in 128"
              :key="`row-${c}`"
              :data-demisemiquaver-index="c"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "MusicSheet",
  data() {
    return {
      array: Array.from({ length: 12 }, (x, i) => i).reverse(),
    };
  },
  computed: {
    ...mapState(["currentMusicalTime", "currentDemisemiquaver"]),
    cursorLeftPosStyle() {
      return {
        left: `${this.currentDemisemiquaver * (100 / 128)}%`,
      };
    },
  },
  methods: {
    /**
     * Returns a string associated to tha given note (in given octave)
     */
    getNoteName(noteIndex, octaveIndex) {
      switch (noteIndex) {
        case 0:
          return "C" + octaveIndex;
        case 1:
          return "C#" + octaveIndex;
        case 2:
          return "D" + octaveIndex;
        case 3:
          return "D#" + octaveIndex;
        case 4:
          return "E" + octaveIndex;
        case 5:
          return "F" + octaveIndex;
        case 6:
          return "F#" + octaveIndex;
        case 7:
          return "G" + octaveIndex;
        case 8:
          return "G#" + octaveIndex;
        case 9:
          return "A" + octaveIndex;
        case 10:
          return "A#" + octaveIndex;
        case 11:
          return "B" + octaveIndex;
        case 12:
          return "C" + octaveIndex;
        default:
          return "missing";
      }
    },
  },
};
</script>
