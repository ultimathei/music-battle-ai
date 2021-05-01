<template>
  <div>
    {{ mode }}
    <!-- <div class="playback_control" v-if="currentPatternInd > 0">
      <PauseIcon v-if="isRunning" @click="startStop" />
      <PlayIcon v-else @click="startStop" />
    </div> -->
    <div class="playback_control">
      <PauseIcon v-if="isRunning" @click="startStop" />
      <PlayIcon v-else @click="startStop" />
    </div>
    <div
      class="playback_control"
      v-if="mode == 'seed_edit'"
    >
      <QuantizeIcon @click="quantizeMelody" v-if="!useQuantized"/>
      <QuantizeIconActive @click="quantizeMelody" v-else/>
    </div>
    <div class="playback_control" v-if="mode == 'seed_edit'">
      <ConfirmIcon @click="confirmSeed" />
    </div>
    <div
      class="playback_control"
      v-if="
        (session.length > 0 || currentPattern.length > 0) &&
        mode != 'seed_recording'
      "
    >
      <TrashIcon @click="trashSession" />
    </div>
  </div>
</template>

<script>
/**
 * This Metronome component is based around the idea in this code repository
 * https://github.com/grantjames/metronome by grantjames.
 *
 * Demisemiquaver is a synonim for the 1/32rd musical note
 */
import { mapGetters, mapActions } from "vuex";
import ConfirmIcon from "../graphics/confirm.svg";
import PauseIcon from "../graphics/pause.svg";
import PlayIcon from "../graphics/play.svg";
import RecordIcon from "../graphics/record.svg";
import RestartIcon from "../graphics/restart.svg";
import QuantizeIcon from "../graphics/quantize.svg";
import QuantizeIconActive from "../graphics/quantize_active.svg";
import TrashIcon from "../graphics/trash.svg";

import {
  CLOCK_ACTION_STARTSTOP,
  CLOCK_ACTION_RESET,
  SESSION_ACTION_CONFIRM_SEED,
  SESSION_ACTION_CLEAR_SESSION,
} from "../../store/actions";

export default {
  name: "Controls",
  components: {
    ConfirmIcon,
    PauseIcon,
    PlayIcon,
    RecordIcon,
    RestartIcon,
    QuantizeIcon,
    QuantizeIconActive,
    TrashIcon,
  },
  computed: {
    ...mapGetters("mainClockStore", [
      "currentBar",
      "currentDemisemiquaver",
      "isRunning",
      "tempo",
      "precountDemisemiquaver",
    ]),
    ...mapGetters(["mode"]),
    ...mapGetters("sessionStore", [
      "session",
      "currentPattern",
      "useQuantized",
    ]),
  },
  methods: {
    ...mapActions("mainClockStore", {
      startStop: CLOCK_ACTION_STARTSTOP,
      resetClock: CLOCK_ACTION_RESET,
    }),
    ...mapActions("sessionStore", {
      confirmSeed: SESSION_ACTION_CONFIRM_SEED,
      clearSession: SESSION_ACTION_CLEAR_SESSION,
      quantizeMelody: "quantizeSeedMelody",
    }),
    trashSession() {
      this.clearSession();
      this.resetClock();
    },
  },
};
</script>
