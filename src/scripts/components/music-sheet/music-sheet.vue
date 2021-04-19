<template>
  <div>
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
          {{ getNoteName(r) }}
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
          <!-- current pattern -->
          <div class="music-sheet__notes | pattern-notes">
            <div
              class="pattern-notes__note"
              v-for="(note, index) in currentPattern"
              :key="`note-${index}`"
              :style="displayNote(note)"
              :data-note-user-type="userTurn"
            ></div>
          </div>

          <!-- previous pattern -->
          <div class="music-sheet__notes | pattern-notes">
            <div
              class="pattern-notes__note | pattern-notes__note--previous"
              v-for="(note, index) in previousPattern"
              :key="`note-${index}`"
              :style="displayNote(note)"
              :data-note-user-type="!userTurn"
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
import LeftArrowIcon from "../graphics/left-arrow.svg";
import RightArrowIcon from "../graphics/right-arrow.svg";

export default {
  name: "MusicSheet",
  components: {
    BattleIcon,
    NotesIcon,
    LeftArrowIcon,
    RightArrowIcon,
  },
  data() {
    return {
      visibleNotes: Array.from(Array(13), (_, index) => 72 - index),
    };
  },
  computed: {
    ...mapState("mainClockStore", ["currentBar", "currentDemisemiquaver"]),
    ...mapState("sessionStore", ["currentPattern", "session", "userTurn"]),
    currentCursorPos() {
      return this.currentBar * 32 + this.currentDemisemiquaver;
    },
    cursorLeftPosStyle() {
      return {
        left: `${this.currentCursorPos * (100 / 128)}%`,
      };
    },
    previousPattern() {
      if (this.session.length > 0)
        return this.session[this.session.length - 1].pattern;
      return [];
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

    /**
     * Returns a string associated to tha given note (in given octave)
     */
    getNoteName(noteIndex) {
      let pitchName;
      switch (noteIndex%12) {
        case 0:
          pitchName="C";
          break;
        case 1:
          pitchName= "C#";
          break;
        case 2:
          pitchName= "D" ;
          break;
        case 3:
          pitchName= "D#" ;
          break;
        case 4:
          pitchName= "E" ;
          break;
        case 5:
          pitchName= "F" ;
          break;
        case 6:
          pitchName= "F#" ;
          break;
        case 7:
          pitchName= "G" ;
          break;
        case 8:
          pitchName= "G#";
          break;
        case 9:
          pitchName= "A" ;
          break;
        case 10:
          pitchName= "A#" ;
          break;
        case 11:
          pitchName= "B";
          break;
        default:
          pitchName= "missing";
          break;
      }
      let octaveIndex = Math.floor(noteIndex/12) -5;
      return pitchName+octaveIndex;
    },

    getMarkerType(c) {
      return c % 32 == 0 ? "bar" : c % 8 == 0 ? "beat" : "";
    },

    getRowType(r) {
      const blackPoses = [1, 3, 6, 8, 10];
      return blackPoses.includes(r % 12) ? "black" : "";
    },
  },
};
</script>
