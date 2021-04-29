<template>
  <div :class="'| pattern-sequence'">
    <BattleIcon class="pattern-sequence__icon" />
    <div class="pattern-sequence__list" ref="sequencer-list">
      <div
        class="pattern-sequence__arrow | arrow-left"
        :data-sequence-arrow-clickable="currentSequencerPage > 0"
        @click="incrementPager(-1)"
      >
        <LeftArrowIcon />
      </div>
      <div class="pattern-sequence__scrollable" :style="pagerStyle">
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
          v-if="
            currentPattern.length != 0 &&
            !seedMelody &&
            !isRunning &&
            !isSessionLoading
          "
        >
          <div class="pattern-sequence__control" @click="confirm">
            Confirm and start battle
          </div>
          <!-- <div class="pattern-sequence__control">Quantize</div> -->
          <div class="pattern-sequence__control">Discard</div>
        </div>

        <div class="pattern-sequence__controls" v-if="isSessionLoading">
          <div class="pattern-sequence__control">Loading..</div>
        </div>
      </div>
      <div
        class="pattern-sequence__arrow | arrow-right"
        :data-sequence-arrow-clickable="
          session.length > currentSequencerPage * sequencerItemFitCount
        "
        @click="incrementPager(1)"
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
  data() {
    return {
      currentSequencerPage: 0,
      containerWidth: 0,
    };
  },
  computed: {
    ...mapGetters("sessionStore", [
      "session",
      "userTurn",
      "currentPattern",
      "seedMelody",
      "isSessionLoading",
    ]),
    ...mapGetters("mainClockStore", ["isRunning"]),
    pagerStyle() {
      return {
        marginLeft: `calc(-${this.currentSequencerPage} * (100% - 40px))`,
      };
    },
    sequencerItemFitCount() {
      return Math.floor(this.containerWidth / 40);
    },
  },
  created() {
    window.addEventListener("resize", this.onResize);
  },
  mounted() {
    this.onResize();
  },
  destroyed() {
    window.removeEventListener("resize", this.onResize);
  },
  methods: {
    ...mapActions("mainClockStore", {
      startStop: CLOCK_ACTION_STARTSTOP,
    }),
    ...mapActions("sessionStore", {
      confirmBase: SESSION_ACTION_CONFIRM_SEED,
      setLoading: SESSION_ACTION_LOADING,
    }),

    onResize(e = null) {
      this.containerWidth = this.$refs["sequencer-list"].clientWidth;
    },

    async confirm() {
      // set loading to true
      this.setLoading();
      setTimeout(() => {
        this.confirmBase(); // sets loading to false
      }, 500);
    },

    incrementPager(increment) {
      let upperbound = 2; // ?
      if (
        this.currentSequencerPage + increment < 0 ||
        this.currentSequencerPage + increment > upperbound
      ) {
        return;
      }
      this.currentSequencerPage += increment;
    },
  },
};
</script>
