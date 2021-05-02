<template>
  <div :class="' | page-battles'">
    <div class="page-battles__content">
      <div class="page-battles__title">Your saved battles</div>
      <div class="page-battles__list">
        <div
          class="page-battles__list-item | battle-list-item"
          v-for="(battle, index) of savedBattles.slice().reverse()"
          :key="`saved-battle-${index}`"
        >
          <div class="battle-list-item__buttons">
            <div class="battle-list-item__buttons-button">
              <PlayIcon />
            </div>
            <div class="battle-list-item__buttons-button | share">
              <ShareIcon />
            </div>
          </div>
          <div class="battle-list-item__details">
            <div class="battle-list-item__detail">
              <div class="battle-list-item__detail-title">
                Battle #{{ savedBattles.length - index }}
              </div>
            </div>
            <div class="battle-list-item__detail">
              <div class="battle-list-item__detail-key">score</div>
              <div class="battle-list-item__detail-value">
                {{ calculateBattleScore(battle.rounds) }}
              </div>
            </div>
            <div class="battle-list-item__detail">
              <div class="battle-list-item__detail-key">battle length</div>
              <div class="battle-list-item__detail-value">
                {{ battle.rounds.length }}
              </div>
            </div>
            <div class="battle-list-item__detail">
              <div class="battle-list-item__detail-key">Battle date</div>
              <div class="battle-list-item__detail-value">
                {{ getDate(battle.created) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import PlayIcon from "../graphics/play.svg";
import ShareIcon from "../graphics/share.svg";

export default {
  name: "BattlesPage",
  components: {
    PlayIcon,
    ShareIcon,
  },
  mounted() {
    this.fetchSavedBattles();
  },
  computed: {
    ...mapGetters(["user", "savedBattles"]),
  },
  methods: {
    ...mapActions(["fetchSavedBattles"]),
    //
    calculateBattleScore(rounds) {
      let score = 0;
      rounds.forEach((round) => {
        score +=
          parseInt(round.scores.score) +
          parseInt(round.scores.improvBonus) +
          parseInt(round.scores.streakBonus);
      });
      return score;
    },

    getDate(milis) {
      let date = new Date(milis);
      console.log(typeof date);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    },
  },
};
</script>
