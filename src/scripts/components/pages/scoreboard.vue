<template>
  <div :class="'| page-scoreboard'">
    <div class="page-scoreboard__title">TOP 5 today</div>
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
            {{ topFiveToday[n - 1] ? topFiveToday[n - 1].score : "-" }}
          </div>
          <div class="page-scoreboard__list-item-username">
            {{ topFiveToday[n - 1] ? topFiveToday[n - 1].username : "-" }}
          </div>
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
            {{ allTime[n - 1] ? allTime[n - 1].score : "-" }}
          </div>
          <div class="page-scoreboard__list-item-username">
            {{ allTime[n - 1] ? allTime[n - 1].username : "-" }}
          </div>
          <div class="page-scoreboard__list-item-avatar">
            <UserIcon />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import UserIcon from "../graphics/user.svg";

export default {
  name: "ScoreBoardPage",
  components: {
    UserIcon,
  },
  async mounted() {
    const alltime = await this.getTopAllTime();
    this.allTime = alltime;
    // console.log(this.allTime);

    const todayScores = await this.getTopFiveToday();
    this.topFiveToday = todayScores;
    // console.log(this.topFiveToday);
  },
  data() {
    return {
      topFiveToday: [],
      allTime: [],
    };
  },
  methods: {
    ...mapActions(["getTopAllTime", "getTopFiveToday"]),
  },
};
</script>
