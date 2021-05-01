<template>
  <div :class="'| pattern-sequence'">
    <BattleIcon class="pattern-sequence__icon" />
    <div class="pattern-sequence__list" ref="sequencer-list">
      <div
        class="pattern-sequence__arrow | arrow-left"
        :data-sequence-arrow-clickable="isPreviousClickable"
        @click="incrementPager(-1)"
      >
        <LeftArrowIcon />
      </div>
      <div class="pattern-sequence__scrollable" :style="pagerStyle">
        <SequencerItem
          class="pattern-sequence__list-item"
          :data-active="aiMelodyArray.length == 0"
          type="human"
          index="seed"
        />
        <template v-for="index in aiMelodyArray.length">
          <SequencerItem
            class="pattern-sequence__list-item"
            :key="`sequence-item-robot-${index}`"
            type="robot"
            :data-active="index == patternPointer && !userTurn"
            :data-upcoming="index > patternPointer"
            :index="`${index}`"
          />
          <SequencerItem
            class="pattern-sequence__list-item"
            :key="`sequence-item-human-${index}`"
            type="human"
            :data-active="index == patternPointer && userTurn"
            :data-upcoming="
              index > patternPointer || (index == patternPointer && !userTurn)
            "
            :index="`${index}`"
          />
        </template>
      </div>
      <div
        class="pattern-sequence__arrow | arrow-right"
        :data-sequence-arrow-clickable="isNextClickable"
        @click="incrementPager(1)"
      >
        <RightArrowIcon />
      </div>
    </div>
    <Controls class="pattern-sequence__controls | playback-controls" />
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import BattleIcon from "../graphics/match.svg";
import LeftArrowIcon from "../graphics/left-arrow.svg";
import RightArrowIcon from "../graphics/right-arrow.svg";
import SequencerItem from "./sequencer-item.vue";
import Controls from "../controls/controls.vue";

import { ACT_clockStartStop, ACT_sessionSetLoading } from "../../store/actions";

export default {
  name: "Sequencer",
  components: {
    BattleIcon,
    LeftArrowIcon,
    RightArrowIcon,
    SequencerItem,
    Controls,
  },
  data() {
    return {
      currentSequencerPage: 0,
      containerWidth: 0,
    };
  },
  computed: {
    ...mapGetters("sessionStore", [
      "userTurn",
      "aiMelodyArray",
      "userMelodyArray",
      "patternPointer",
    ]),
    // local computed
    pagerStyle() {
      return {
        marginLeft: `calc(-${this.currentSequencerPage} * (100% - 40px))`,
      };
    },
    sequencerItemFitCount() {
      return Math.floor(this.containerWidth / 40);
    },
    isNextClickable() {
      return false;
    },
    isPreviousClickable() {
      return false;
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
      startStop: ACT_clockStartStop,
    }),
    ...mapActions("sessionStore", {
      setLoading: ACT_sessionSetLoading,
    }),

    onResize(e = null) {
      this.containerWidth = this.$refs["sequencer-list"].clientWidth;
    },

    incrementPager(increment) {
      return; // do later
      // let upperbound = 2; // ?
      // if (
      //   this.currentSequencerPage + increment < 0 ||
      //   this.currentSequencerPage + increment > upperbound
      // ) {
      //   return;
      // }
      // this.currentSequencerPage += increment;
    },
  },
};
</script>
