<template>
  <div
    :class="'| start-widget'"
  >
    <div class="start-widget__box">
      <p class="start-widget__title">Hey, Mate!</p>
      <p class="start-widget__subtitle">
        Record the first four bars of the tune and let's battle!
      </p>
      <div class="start-widget__button" @click="startRecord">Start</div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { CLOCK_ACTION_STARTSTOP } from "../../store/actions";

export default {
  name: "StartWidget",
  methods: {
    ...mapActions("mainClockStore", {
      startRecord: CLOCK_ACTION_STARTSTOP,
    }),
  },
};
</script>

<style></style>
