<template>
  <div>
    <div class="app__pattern-sequence | pattern-sequence">
      <BattleIcon class="pattern-sequence__icon" />
      <div class="pattern-sequence__list">
        <div
          class="pattern-sequence__scrollable"
          :style="{ width: `${patternCount * 50}px` }"
        >
          <div
            v-for="(pattern, index) in session"
            :data-sequence-list-item-type="pattern.type"
            :key="`sequence-item-${index}`"
            class="pattern-sequence__list-item"
          >
            {{ index + 1 }}
          </div>
          <div
            class="pattern-sequence__list-item"
            data-sequence-list-item-type="preview"
          >...</div>
        </div>
      </div>
    </div>

    <div class="app__music-sheet | music-sheet">
      <div class="music-sheet__side">
        <div class="music-sheet__header">
          <NotesIcon class="music-sheet__header-icon" />
        </div>
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
          <div
            class="music-sheet__row"
            v-for="r of array"
            :key="`row-${r}`"
            :ref="`pitch-${r}`"
            :data-row-index="r"
          >
            <div
              class="music-sheet__column"
              v-for="c in 128"
              :key="`column-${c}`"
              :ref="`cell-${c}`"
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
import BattleIcon from "../graphics/match.svg";
import NotesIcon from "../graphics/notes.svg";

export default {
  name: "MusicSheet",
  components: {
    BattleIcon,
    NotesIcon,
  },
  data() {
    return {
      array: Array.from(Array(12), (_, index) => 71 - index),
      patternCount: 20,
    };
  },
  mounted() {
    this.updateMusicSheetNotes();
  },
  computed: {
    ...mapState("mainClockStore", ["currentBar", "currentDemisemiquaver"]),
    ...mapState("sessionStore", ["currentUserPattern", "session"]),
    currentCursorPos() {
      return this.currentBar * 32 + this.currentDemisemiquaver;
    },
    cursorLeftPosStyle() {
      return {
        left: `${this.currentCursorPos * (100 / 128)}%`,
      };
    },
  },
  watch: {
    currentDemisemiquaver() {
      // update music sheet on every 1/32
      this.updateMusicSheetNotes();
    },
  },
  methods: {
    updateMusicSheetNotes() {
      // for each note of current pattern
      for (let note of this.currentUserPattern) {
        // get all DOM cells in this note pitch (row)
        let note_cells_DOM = this.$el.querySelectorAll(
          `[data-note-cell-index='${note.note}'][data-demisemiquaver-cell-index]`
        );

        // test ref version
        // let cell_refs = this.$refs[`pitch-${note.note}`];
        // console.log('cell_refs', cell_refs[0]);

        for (let cell of note_cells_DOM) {
          let demisemiIndex = cell.dataset.demisemiquaverCellIndex;

          if (
            note.end &&
            demisemiIndex == note.start &&
            demisemiIndex == note.end
          ) {
            cell.setAttribute("data-note-cell-status", "singlecell");
          } else if (demisemiIndex == note.start) {
            cell.setAttribute("data-note-cell-status", "start");
          } else if (
            note.end &&
            demisemiIndex > note.start &&
            demisemiIndex < note.end
          ) {
            cell.setAttribute("data-note-cell-status", "inbetween");
          } else if (
            !note.end &&
            demisemiIndex > note.start &&
            demisemiIndex < this.currentCursorPos
          ) {
            cell.setAttribute("data-note-cell-status", "inbetween");
          } else if (note.end && demisemiIndex == note.end) {
            cell.setAttribute("data-note-cell-status", "end");
          } else if (!note.end && demisemiIndex == this.currentCursorPos) {
            cell.setAttribute("data-note-cell-status", "end");
          }
        }
      }
    },

    clearMusicSheetNotes() {
      let note_cells_all_DOM = this.$el.querySelectorAll(
        "[data-note-cell-index]"
      );
      for (let cellDOM of note_cells_all_DOM) {
        cellDOM.setAttribute("data-note-cell-active", false);
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
