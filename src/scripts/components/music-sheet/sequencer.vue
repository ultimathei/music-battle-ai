<template>
  <div :class="'| pattern-sequence'">
    <BattleIcon class="pattern-sequence__icon" />
    <div class="pattern-sequence__list">
      <div
        class="pattern-sequence__arrow"
        :data-sequence-arrow-clickable="false"
      >
        <LeftArrowIcon />
      </div>
      <div
        class="pattern-sequence__scrollable"
        :style="{ width: `${session.length * 50}px` }"
      >
        <SequencerItem
          class="pattern-sequence__list-item"
          v-for="(pattern, index) in session"
          :key="`sequence-item-${index}`"
          :type="pattern.type"
          :index="index"
        />
        <SequencerItem
          class="pattern-sequence__list-item | active"
          :type="userTurn ? 'human' : 'robot'"
          :index="session.length"
        />

        <div
          class="pattern-sequence__controls"
          v-if="currentPattern.length != 0 && !seedMelody && !isRunning && !isSessionLoading"
        >
          <div class="pattern-sequence__control" @click="confirm">
            Confirm and start battle
          </div>
          <!-- <div class="pattern-sequence__control">Quantize</div> -->
          <div class="pattern-sequence__control">Discard</div>
        </div>

        <div class="pattern-sequence__controls" v-if="isSessionLoading">
          <div class="pattern-sequence__control" >
            Loading..
          </div>
        </div>
      </div>
      <div
        class="pattern-sequence__arrow"
        :data-sequence-arrow-clickable="true"
      >
        <RightArrowIcon />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import BattleIcon from "../graphics/match.svg";
import LeftArrowIcon from "../graphics/left-arrow.svg";
import RightArrowIcon from "../graphics/right-arrow.svg";
import SequencerItem from "./sequencer-item.vue";

import {
  CLOCK_ACTION_STARTSTOP,
  SESSION_ACTION_CONFIRM_SEED,
  SESSION_ACTION_LOADING,
} from "../../store/actions";

export default {
  name: "Sequencer",
  components: {
    BattleIcon,
    LeftArrowIcon,
    RightArrowIcon,
    SequencerItem,
  },
  computed: {
    ...mapGetters("sessionStore", [
      "session",
      "userTurn",
      "currentPattern",
      "seedMelody",
      "isSessionLoading"
    ]),
    ...mapGetters("mainClockStore", ["isRunning"]),
  },
  methods: {
    ...mapActions("mainClockStore", {
      startStop: CLOCK_ACTION_STARTSTOP,
    }),
    ...mapActions("sessionStore", {
      confirmBase: SESSION_ACTION_CONFIRM_SEED,
      setLoading: SESSION_ACTION_LOADING,
    }),

    async confirm() {
      // set loading to true
      this.setLoading();
      setTimeout(() => {
        this.confirmBase(); // sets loading to false
      }, 500);
    },
  },
};
</script>
