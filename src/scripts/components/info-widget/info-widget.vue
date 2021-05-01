<template>
  <div :class="'| info-widget'">
    <div class="info-widget__box">
      <p class="info-widget__title">{{ title }}</p>
      <p class="info-widget__subtitle">{{ description }}</p>
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
          v-if="mode != 'scoring'"
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
    ...mapGetters("sessionStore", ["deleteInitiated"]),

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
      else if (this.mode == "scoring") return "Calculating your scores..";
      return "Click button to resume";
    },
    buttonText() {
      if (this.deleteInitiated) return "Delete";
      else if (this.mode == "initial") return "Start new battle";
      else if (this.mode == "scoring") return "Listen whole battle";
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
