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
import { mapGetters } from "vuex";
import BattleIcon from "../graphics/match.svg";
import LeftArrowIcon from "../graphics/left-arrow.svg";
import RightArrowIcon from "../graphics/right-arrow.svg";
import SequencerItem from "./sequencer-item.vue";

export default {
  name: "Sequencer",
  components: {
    BattleIcon,
    LeftArrowIcon,
    RightArrowIcon,
    SequencerItem,
  },
  computed: {
    ...mapGetters("sessionStore", ["session", "userTurn"]),
  },
};
</script>
