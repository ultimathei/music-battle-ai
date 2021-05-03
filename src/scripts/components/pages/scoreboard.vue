<template>
  <div :class="'| page-scoreboard'">
    <div class="page-scoreboard__title">TOP 5 this week</div>
    <div class="page-scoreboard__list">
      <div
        class="page-scoreboard__list-item"
        v-for="n in 5"
        :key="'thie-week-best-' + n"
        :data-index="n"
      >
        <div class="page-scoreboard__list-item-count">{{ n }} //</div>
        <div class="page-scoreboard__list-item-details">
          <div class="page-scoreboard__list-item-score">
            {{ (6 - n) * 1000 }}
          </div>
          <div class="page-scoreboard__list-item-username">User name</div>
          <div class="page-scoreboard__list-item-avatar">
            <UserIcon />
          </div>
        </div>
      </div>
    </div>

    <div class="page-scoreboard__title">TOP 5 all time</div>
    <div class="page-scoreboard__list">
      <div
        class="page-scoreboard__list-item"
        v-for="n in 5"
        :key="'all-time-best-' + n"
        :data-index="n"
      >
        <div class="page-scoreboard__list-item-count">{{ n }} //</div>
        <div class="page-scoreboard__list-item-details">
          <div class="page-scoreboard__list-item-score">
            {{ (6 - n) * 1000 }}
          </div>
          <div class="page-scoreboard__list-item-username">User name</div>
          <div class="page-scoreboard__list-item-avatar">
            <UserIcon />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UserIcon from "../graphics/user.svg";

export default {
  name: "ScoreBoardPage",
  components: {
    UserIcon,
  },
};
</script>
