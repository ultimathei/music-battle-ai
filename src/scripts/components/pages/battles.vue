<template>
  <div :class="' | page-battles'">
    <div class="page-battles__content">
      <div class="page-battles__title">Your saved battles</div>
      <div class="page-battles__list">
        <div
          class="page-battles__list-item | battle-list-item"
          v-for="n in 10"
          :key="n"
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
              <div class="battle-list-item__detail-key">score</div>
              <div class="battle-list-item__detail-value">90000</div>
            </div>
            <div class="battle-list-item__detail">
              <div class="battle-list-item__detail-key">battle length</div>
              <div class="battle-list-item__detail-value">5 match</div>
            </div>
            <div class="battle-list-item__detail">
              <div class="battle-list-item__detail-key">created</div>
              <div class="battle-list-item__detail-value">12/02/21</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PlayIcon from "../graphics/play.svg";
import ShareIcon from "../graphics/share.svg";
export default {
  name: "BattlesPage",
  components: {
    PlayIcon,
    ShareIcon,
  },
};
</script>
