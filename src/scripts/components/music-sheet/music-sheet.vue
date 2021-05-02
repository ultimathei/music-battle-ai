<template>
  <div :class="'| music-sheet'">
    <div class="music-sheet__side">
      <div class="music-sheet__header">
        <NotesIcon class="music-sheet__header-icon" />
      </div>
      <div
        class="music-sheet__side-row"
        v-for="r of visibleNotes"
        :key="`row-${r}`"
      >
        {{ noteName(r) }}
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

      <div
        class="music-sheet__cursor"
        :style="cursorLeftPosStyle"
        :data-active="metronomeFlashActive"
      ></div>
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
            v-for="(note, index) in activePattern"
            :key="`note-${index}`"
            :style="displayNote(note)"
            :data-note-user-type="userTurn"
          ></div>
        </div>

        <!-- previous pattern -->
        <div class="music-sheet__notes | pattern-notes" v-if="userTurn">
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

    <div class="music-sheet__precount-wrap" v-if="isPrecountVisible">
      <div class="music-sheet__precount">{{ precountDisplayValue }}</div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import BattleIcon from "../graphics/match.svg";
import NotesIcon from "../graphics/notes.svg";
import LeftArrowIcon from "../graphics/left-arrow.svg";
import RightArrowIcon from "../graphics/right-arrow.svg";
import { getNoteName } from "../../utils/utils";

export default {
  name: "MusicSheet",
  components: {
    BattleIcon,
    NotesIcon,
    LeftArrowIcon,
    RightArrowIcon,
  },
  computed: {
    ...mapGetters("mainClockStore", [
      "currentBar",
      "currentDemisemiquaver",
      "currentCursorPos",
      "isRunning",
      "precountDemisemiquaver",
      "metronomeFlashActive",
    ]),
    ...mapGetters("instrumentStore", [
      "rangeStart",
      "rangeEnd",
      "visibleNotes",
    ]),
    ...mapGetters("sessionStore", [
      "currentPattern",
      "quantizedSeedMelody",
      "seedMelody",
      "userTurn",
      "isSessionLoading",
      "useQuantized",
      "aiMelodyArray",
      "userMelodyArray",
      "patternPointer",
    ]),
    ...mapGetters(["mode"]),

    // local computed
    activePattern() {
      if (this.mode == "seed_recording" || this.mode == "seed_edit" || this.mode == "loading") {
        if (this.useQuantized) {
          return this.quantizedSeedMelody;
        } else {
          return this.currentPattern;
        }
      } else if (this.mode == "playback") {
        if (this.userTurn) {
          return this.userMelodyArray[this.patternPointer-1] || [];
        } else {
          return this.aiMelodyArray[this.patternPointer-1] || [];
        }
      } else {
        if (this.userTurn) {
          return this.currentPattern;
        } else {
          return this.aiMelodyArray[this.patternPointer-1] || [];
        }
      }
    },
    previousPattern() {
      // if (this.session.length > 0)
        return this.aiMelodyArray[this.patternPointer-1];
      // return [];
    },
    cursorLeftPosStyle() {
      return {
        left: `${this.currentCursorPos * (100 / 128)}%`,
      };
    },
    isPrecountVisible() {
      return this.isRunning && this.precountDisplayValue > 0;
    },
    precountDisplayValue() {
      return 4 - Math.floor(this.precountDemisemiquaver / 8);
    },
  },
  methods: {
    displayNote(note) {
      // don't display if no end and cursor is behind the start of note
      if (
        (!note.end && note.start > this.currentCursorPos) ||
        note.end == note.start
      )
        return {};
      // display note til cursor if no end and cursor is after start of note
      let end = note.end ? note.end : this.currentCursorPos;

      return {
        width: `calc((100% / 128 ) * ${end - note.start})`,
        height: `calc(100% / ${this.visibleNotes.length})`,
        left: `calc((100% / 128 ) * ${note.start})`,
        top: `calc((100% /  ${this.visibleNotes.length}) * ${
          this.rangeEnd - note.note
        })`,
      };
    },

    noteName(noteIndex) {
      return getNoteName(noteIndex);
    },

    getRowType(r) {
      const blackPoses = [1, 3, 6, 8, 10];
      return blackPoses.includes(r % 12) ? "black" : "";
    },

    getMarkerType(c) {
      return c % 32 == 0 ? "bar" : c % 8 == 0 ? "beat" : "";
    },
  },
};
</script>
