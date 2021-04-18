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
            {{ Math.floor(index / 2) + 1 }}
          </div>
          <div
            class="pattern-sequence__list-item | active"
            :data-sequence-list-item-type="userTurn ? 'human' : 'robot'"
          >
            {{ Math.floor(session.length / 2) + 1 }}
          </div>
        </div>
      </div>
    </div>

    <div class="app__music-sheet | music-sheet">
      <div class="music-sheet__side">
        <div class="music-sheet__header">
          <NotesIcon class="music-sheet__header-icon" />
        </div>
        <div
          class="music-sheet__side-row"
          v-for="r of visibleNotes"
          :key="`row-${r}`"
        >
          {{ getNoteName(r, 0) }}
        </div>
      </div>
      <div class="music-sheet__body">
        <div class="music-sheet__base-grid-cols | music-sheet-grid-cols">
          <div
            v-for="c in 128"
            :key="`col-${c}`"
            :data-ms-col-marker="getMarkerType(c)"
            class="music-sheet-grid-cols__col"
          ></div>
        </div>

        <div class="music-sheet__cursor" :style="cursorLeftPosStyle"></div>
        <div class="music-sheet__header">
          <div
            v-for="i in 4"
            :key="`bar-count-${i}`"
            class="music-sheet__header-bar"
          >
            {{ i }}
          </div>
        </div>
        <div class="music-sheet__content">
          <!-- user pattern -->
          <div class="music-sheet__notes | pattern-notes">
            <div
              class="pattern-notes__note"
              v-for="(note, index) in currentUserPattern"
              :key="`testnote-${index}`"
              :style="displayNote(note)"
            ></div>
          </div>
          <!-- response pattern -->
          <div class="music-sheet__notes | pattern-notes">
            <div
              class="pattern-notes__note"
              v-for="(note, index) in currentResponsePattern"
              :key="`testnote-${index}`"
              :style="displayNote(note)"
            ></div>
          </div>

          <div class="music-sheet__base-grid-rows | music-sheet-grid-rows">
            <div
              class="music-sheet-grid-rows__row"
              v-for="(r, index) of visibleNotes"
              :key="`col-${index}`"
              :data-ms-row-type="getRowType(r)"
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
      visibleNotes: Array.from(Array(12), (_, index) => 71 - index),
      patternCount: 20,
    };
  },
  computed: {
    ...mapState("mainClockStore", ["currentBar", "currentDemisemiquaver"]),
    ...mapState("sessionStore", [
      "currentUserPattern",
      "currentResponsePattern",
      "session",
      "userTurn",
    ]),
    currentCursorPos() {
      return this.currentBar * 32 + this.currentDemisemiquaver;
    },
    cursorLeftPosStyle() {
      return {
        left: `${this.currentCursorPos * (100 / 128)}%`,
      };
    },
  },
  methods: {
    displayNote(note) {
      // don't display if no end and cursor is behind the start of note
      if (!note.end && note.start > this.currentCursorPos) return {};
      // display note til cursor if no end and cursor is after start of note
      let end = note.end ? note.end : this.currentCursorPos;

      return {
        width: `calc((100% / 128 ) * ${end - note.start})`,
        height: `calc(100% / ${this.visibleNotes.length})`,
        left: `calc((100% / 128 ) * ${note.start})`,
        top: `calc((100% / 12) * ${71 - note.note})`,
      };
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

    getMarkerType(c) {
      return c % 32 == 0 ? "bar" : c % 8 == 0 ? "beat" : "";
    },

    getRowType(r){
      const blackPoses = [1,3,6,8,10];
      return blackPoses.includes(r%12) ? 'black' : '';
    },
  },
};
</script>
