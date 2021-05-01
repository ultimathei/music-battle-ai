<template>
  <div :class="'| info-widget'">
    <div class="info-widget__box">
      <p class="info-widget__title">{{ title }}</p>
      <p class="info-widget__subtitle">{{ description }}</p>

      <div
        class="info-widget__scores"
        v-if="this.mode == 'scoring' && battleScores"
      >
        <div class="info-widget__score">
          <div class="info-widget__score-title">Score</div>
          <div class="info-widget__score-value">{{ avgBattleScore }}</div>
        </div>
        <div class="info-widget__score">
          <div class="info-widget__score-title">Bonus</div>
          <div class="info-widget__score-value">
            +{{ totalBattleBonus }}
          </div>
        </div>

        <div class="info-widget__score">
          <div class="info-widget__score-title">Total</div>
          <div class="info-widget__score-value">
            {{ avgBattleScore + totalBattleBonus }}
          </div>
        </div>
      </div>

      <div class="info-widget__buttons">
        <div
          class="info-widget__button cancel-button"
          @click="mutateDeleteInitiated"
          v-if="deleteInitiated"
        >
          Cancel
        </div>
        <div
          class="info-widget__button"
          @click="confirmButtonAction"
          v-if="!(mode == 'scoring' && !battleScores)"
        >
          {{ buttonText }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import {
  ACT_clockStartStop,
  ACT_clockReset,
  ACT_sessionClearSession,
} from "../../store/actions";

export default {
  name: "StartWidget",
  computed: {
    ...mapGetters(["mode"]),
    ...mapGetters("sessionStore", [
      "deleteInitiated",
      "battleScores",
      "totalBattleBonus",
      "avgBattleScore",
    ]),

    // local computed
    title() {
      if (this.deleteInitiated) return "Delete melody";
      else if (this.mode == "initial") return "Hey, Mate!";
      else if (this.mode == "scoring") return "End of Battle";
      return "Battle paused";
    },
    description() {
      if (this.deleteInitiated)
        return "Are you sure? The melody cannot be retrieved once deleted!";
      else if (this.mode == "initial")
        return "Start the battle by recording a four bar melody!";
      else if (this.mode == "scoring" && !this.battleScores) return "Calculating your scores..";
      else if (this.mode == "scoring" && this.battleScores) return "Your scores in this battle";
      return "Click button to resume";
    },
    buttonText() {
      if (this.deleteInitiated) return "Delete";
      else if (this.mode == "initial") return "Start new battle";
      else if (this.mode == "scoring") return "Next Battle";
      else if (this.mode == "done") return "Next Battle";
      return "Resume battle";
    },
  },
  methods: {
    ...mapActions("mainClockStore", {
      startRecord: ACT_clockStartStop,
      resetClock: ACT_clockReset,
    }),
    ...mapActions("sessionStore", {
      clearSession: ACT_sessionClearSession,
    }),
    ...mapMutations("sessionStore", ["mutateDeleteInitiated"]),
    // local actions
    confirmButtonAction() {
      if (!this.deleteInitiated) this.startRecord();
      else this.trashSession();
    },
    trashSession() {
      this.clearSession();
      this.resetClock();
    },
  },
};
</script>

<style></style>
