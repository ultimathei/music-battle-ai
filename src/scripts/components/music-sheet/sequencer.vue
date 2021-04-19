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
        <div
          class="pattern-sequence__list-item"
          v-for="(pattern, index) in session"
          :data-sequence-list-item-type="pattern.type"
          :key="`sequence-item-${index}`"
        >
          {{ Math.floor(index / 2) + 1 }}
        </div>
        <div
          class="pattern-sequence__list-item | active"
          :data-sequence-list-item-type="userTurn ? 'human' : 'robot'"
        >
          {{ Math.floor(session.length / 2) + 1 }}
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
import { mapState } from "vuex";
import BattleIcon from "../graphics/match.svg";
import LeftArrowIcon from "../graphics/left-arrow.svg";
import RightArrowIcon from "../graphics/right-arrow.svg";

export default {
  name: "Sequencer",
  components: {
    BattleIcon,
    LeftArrowIcon,
    RightArrowIcon,
  },
  computed: {
    ...mapState("sessionStore", ["session", "userTurn"]),
  },
};
</script>
