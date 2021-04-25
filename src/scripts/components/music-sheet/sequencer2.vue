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
        <!-- <div class="pattern-sequence__match-items active">
          <div
            class="pattern-sequence__match-item | sequencer-item"
            data-sequence-list-item-type="robot"
          ></div>
          <div
            class="pattern-sequence__match-item | sequencer-item"
            data-sequence-list-item-type="human"
          ></div>
        </div>

        <div class="pattern-sequence__match-items future">
          <div
            class="pattern-sequence__match-item | sequencer-item"
            data-sequence-list-item-type="robot"
          ></div>
          <div
            class="pattern-sequence__match-item | sequencer-item"
            data-sequence-list-item-type="human"
          ></div>
        </div> -->

        <SequencerItem
          class="pattern-sequence__list-item"
          v-for="(pattern, index) in aiMelodyArray"
          :key="`sequence-item-${index}`"
          type="human"
          :index="index"
        />
        <!--
        <SequencerItem
          class="pattern-sequence__list-item | active"
          :type="userTurn ? 'human' : 'robot'"
          :index="session.length"
        /> -->

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
} from "../../store/actions";

export default {
  name: "Sequencer2",
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
      "userMelodyArray",
      "aiMelodyArray",
    ]),
    ...mapGetters("mainClockStore", ["isRunning"]),
  },
  methods: {
    ...mapActions("mainClockStore", {
      startStop: CLOCK_ACTION_STARTSTOP,
    }),
    ...mapActions("sessionStore", {
      confirmBase: SESSION_ACTION_CONFIRM_SEED,
    }),
  },
};
</script>
