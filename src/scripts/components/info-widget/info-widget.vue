<template>
  <div :class="'| info-widget'">
    <div class="info-widget__box">
      <p class="info-widget__title">{{ title }}</p>
      <p class="info-widget__subtitle">{{ description }}</p>

      <div class="info-widget__scores" v-if="mode == 'scoring' && battleScores">
        <div class="info-widget__score">
          <div class="info-widget__score-title">Score</div>
          <div class="info-widget__score-value">{{ avgBattleScore }}</div>
          <div class="info-widget__score-icon">
            <InLoveEmoji v-if="avgBattleScore >= 80" />
            <CoolEmoji v-else-if="avgBattleScore >= 40" />
            <SweatEmoji v-else />
          </div>
        </div>
        <div class="info-widget__score">
          <div class="info-widget__score-title">Improv Bonus</div>
          <div class="info-widget__score-value">+{{ totalBattleBonus }}</div>
          <div class="info-widget__score-icon">
            <InLoveEmoji v-if="totalBattleBonus >= 40" />
            <CoolEmoji v-else-if="totalBattleBonus >= 1" />
          </div>
        </div>
        <div class="info-widget__score">
          <div class="info-widget__score-title">Streak Bonus</div>
          <div class="info-widget__score-value">+{{ streakIndex * 10 }}</div>
          <div class="info-widget__score-icon">
            <InLoveEmoji v-if="streakIndex >= 3" />
            <CoolEmoji v-else-if="streakIndex >= 1" />
          </div>
        </div>

        <div class="info-widget__score">
          <div class="info-widget__score-title">Battle total</div>
          <div class="info-widget__score-value">
            {{ avgBattleScore + totalBattleBonus + streakIndex * 10 }}
          </div>
          <div class="info-widget__score-icon">
            <InLoveEmoji v-if="avgBattleScore + totalBattleBonus >= 100" />
            <CoolEmoji v-else-if="avgBattleScore + totalBattleBonus >= 50" />
            <SweatEmoji v-else />
          </div>
        </div>

        <div class="info-widget__score">
          <div class="info-widget__score-title">Daily goal</div>
          <div class="info-widget__score-value">
            {{ dailyTotal }}/{{ dailyGoal }}
          </div>
          <div class="info-widget__score-icon">
            <InLoveEmoji v-if="dailyTotal >= dailyGoal" />
            <CoolEmoji v-else-if="dailyTotal >= dailyGoal / 2" />
            <TongueEmoji v-else />
          </div>
        </div>
      </div>

      <div class="info-widget__buttons" v-if="mode == 'scoring'">
        <div class="info-widget__button end-session-button" @click="endSession">
          End battle
        </div>
        <div
          class="info-widget__button continue-session-button"
          @click="continueBattle"
        >
          Continue battle
        </div>
      </div>

      <div class="info-widget__buttons" v-else>
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
          v-if="!(mode == 'scoring' && !battleScores) && mode != 'loading'"
        >
          {{ buttonText }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CoolEmoji from "../graphics/cool.svg";
import SweatEmoji from "../graphics/sweat.svg";
import InLoveEmoji from "../graphics/in-love.svg";
import TongueEmoji from "../graphics/tongue.svg";
import { mapActions, mapGetters, mapMutations } from "vuex";
import {
  ACT_clockStartStop,
  ACT_clockReset,
  ACT_sessionClearSession,
} from "../../store/actions";

export default {
  name: "StartWidget",
  components: {
    CoolEmoji,
    InLoveEmoji,
    SweatEmoji,
    TongueEmoji,
  },
  computed: {
    ...mapGetters(["mode", "dailyGoal", "dailyTotal"]),
    ...mapGetters("sessionStore", [
      "deleteInitiated",
      "battleScores",
      "totalBattleBonus",
      "avgBattleScore",
      "streakIndex",
    ]),
    ...mapGetters("modelStore", ["numberOfSamples", "similarity"]),

    // local computed
    title() {
      if (this.deleteInitiated) return "Delete melody";
      else if (this.mode == "loading") return "Get ready!";
      else if (this.mode == "initial") return "Hey, Mate!";
      else if (this.mode == "scoring") return "Checkpoint";
      return "Battle paused";
    },
    description() {
      if (this.deleteInitiated)
        return "Are you sure? The melody cannot be retrieved once deleted! Your streak will break, but the scores saved at the last checkpoint are safe!";
      else if (this.mode == "loading") return "Working on my melodies..";
      else if (this.mode == "initial")
        return "Start the battle by recording a four bar melody!";
      else if (this.mode == "scoring" && !this.battleScores)
        return "Calculating your scores..";
      else if (this.mode == "scoring" && this.battleScores)
        return `Your scores in this battle #${this.streakIndex+1}`;
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
      continueSession: "continueSession",
    }),
    ...mapMutations("sessionStore", ["mutateDeleteInitiated"]),
    ...mapMutations("modelStore", [
      "mutateNumberOfSamples",
      "mutateSimilarity",
    ]),
    ...mapMutations(["mutateMode"]),
    // local actions
    confirmButtonAction() {
      if (!this.deleteInitiated) this.startRecord();
      else this.trashSession();
    },
    trashSession() {
      this.clearSession();
      this.resetClock();
    },
    endSession() {
      // trash session
      this.trashSession();
      // maybe open up profile with saved sessions

      //...
    },
    continueBattle() {
      // 2. clear session, keep seed, set mode to loading
      this.mutateMode("loading");
      // change similarity a tiny bit (-0.05)
      this.mutateSimilarity(this.similarity - 0.05);
      // increase sample count (+2)
      this.mutateNumberOfSamples(this.numberOfSamples + 2);

      setTimeout(() => {
        // 3. generate new aiMelodies
        this.continueSession();
      }, 50);
    },
  },
};
</script>

<style></style>
