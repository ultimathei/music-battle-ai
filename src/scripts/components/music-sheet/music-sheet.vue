<template>
  <div>
    <div class="app__music-sheet | music-sheet">
      <div class="music-sheet__side">
        <div class="music-sheet__header"></div>
        <div class="music-sheet__row" v-for="r of array" :key="`row-${r}`">
          {{ getNoteName(r, 0) }}
        </div>
      </div>
      <div class="music-sheet__body">
        <div class="music-sheet__cursor" :style="cursorLeftPosStyle"></div>
        <div class="music-sheet__header">
          <div
            v-for="(n, i) in 4"
            :key="`musicsheet-header-marker${i}`"
            class="music-sheet__header-timestamp"
            :data-musicsheet-header-marker="i"
          >
            {{ n }}
          </div>
          <div
            class="music-sheet__column"
            v-for="c in 128"
            :key="`header-marker-${c}`"
            :data-demisemiquaver-cell-index="c"
          ></div>
        </div>
        <div class="music-sheet__content">
          <div class="music-sheet__row" v-for="r of array" :key="`row-${r}`">
            <div
              class="music-sheet__column"
              v-for="c in 128"
              :key="`column-${c}`"
              :data-note-cell-index="r"
              :data-demisemiquaver-cell-index="c"
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
      // array: new Array(60,61,62,63,64,65,66,67,68,69,70,71).reverse(),
      array: Array.from(Array(12), (_, index) => 71-index),
    };
  },
  mounted() {
    this.updateMusicSheetNotes();
  },
  computed: {
    ...mapState("mainClockStore", ["currentBar", "currentDemisemiquaver"]),
    ...mapState("sessionStore", ["sessions"]),
    currentCursorPos() {
      return this.currentBar * 32 + this.currentDemisemiquaver;
    },
    cursorLeftPosStyle() {
      return {
        left: `${this.currentCursorPos * (100 / 128)}%`,
      };
    },
  },
  watch:{
    currentDemisemiquaver(newVal, oldVal) {
      // update music sheet on every 1/32
      this.updateMusicSheetNotes()
    }
  },
  methods: {
    updateMusicSheetNotes() {
      for (let session of this.sessions) {
        let note_start_cells_DOM = this.$el.querySelectorAll(
          `[data-note-cell-index='${session.note}'][data-demisemiquaver-cell-index]`
        );
        let active_cells = [].filter.call(
          note_start_cells_DOM,
          (cell) =>
            cell.dataset.demisemiquaverCellIndex >= session.start && (
              cell.dataset.demisemiquaverCellIndex <= session.end || 
              !session.end && cell.dataset.demisemiquaverCellIndex <= this.currentCursorPos
            )
        );

        for (let cellDOM of active_cells) {
          cellDOM.setAttribute("data-note-cell-active", true);
        }
      }
    },
    /**
     * Returns a string associated to tha given note (in given octave)
     */
    getNoteName(noteIndex, octaveIndex) {
      switch (noteIndex) {
        case 60:
          return "C" + octaveIndex;
        case 61:
          return "C#" + octaveIndex;
        case 62:
          return "D" + octaveIndex;
        case 63:
          return "D#" + octaveIndex;
        case 64:
          return "E" + octaveIndex;
        case 65:
          return "F" + octaveIndex;
        case 66:
          return "F#" + octaveIndex;
        case 67:
          return "G" + octaveIndex;
        case 68:
          return "G#" + octaveIndex;
        case 69:
          return "A" + octaveIndex;
        case 70:
          return "A#" + octaveIndex;
        case 71:
          return "B" + octaveIndex;
        case 72:
          return "C" + octaveIndex;
        default:
          return "missing";
      }
    },
  },
};
</script>
