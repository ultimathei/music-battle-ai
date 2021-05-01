<template>
  <div>
    <div
      class="playback_control"
      v-if="
        !isRunning &&
        (session.length > 0 || currentPattern.length > 0) &&
        mode != 'seed_recording' &&
        mode != 'scoring'
      "
    >
      <TrashIcon @click="askToDelete" v-if="!deleteInitiated" />
      <TrashIconActive @click="askToDelete" v-else />
    </div>
    <div
      class="playback_control"
      v-if="mode == 'seed_edit' && !deleteInitiated"
    >
      <QuantizeIcon @click="quantizeMelody" v-if="!useQuantized" />
      <QuantizeIconActive @click="quantizeMelody" v-else />
    </div>
    <div
      class="playback_control"
      v-if="mode == 'seed_edit' && !deleteInitiated"
    >
      <ConfirmIcon @click="confirmSeed" />
    </div>
    <div class="playback_control" v-if="!deleteInitiated">
      <PauseIcon v-if="isRunning" @click="startStop" />
      <PlayIcon v-else @click="startStop" />
    </div>

    <!-- test this -->
    <div class="info-bubble">Mode now: {{ mode }}</div>
  </div>
</template>

<script>
/**
 * This Metronome component is based around the idea in this code repository
 * https://github.com/grantjames/metronome by grantjames.
 *
 * Demisemiquaver is a synonim for the 1/32rd musical note
 */
import { mapGetters, mapActions, mapMutations } from "vuex";
import ConfirmIcon from "../graphics/confirm.svg";
import PauseIcon from "../graphics/pause.svg";
import PlayIcon from "../graphics/play.svg";
import RecordIcon from "../graphics/record.svg";
import RestartIcon from "../graphics/restart.svg";
import QuantizeIcon from "../graphics/quantize.svg";
import QuantizeIconActive from "../graphics/quantize_active.svg";
import TrashIcon from "../graphics/trash.svg";
import TrashIconActive from "../graphics/trash_active.svg";

import {
  CLOCK_ACTION_STARTSTOP,
  CLOCK_ACTION_RESET,
  SESSION_ACTION_CONFIRM_SEED,
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
    TrashIconActive,
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
      "deleteInitiated",
    ]),
  },
  methods: {
    ...mapActions("mainClockStore", {
      startStop: CLOCK_ACTION_STARTSTOP,
      resetClock: CLOCK_ACTION_RESET,
    }),
    ...mapActions("sessionStore", {
      confirmSeed: SESSION_ACTION_CONFIRM_SEED,
      quantizeMelody: "quantizeSeedMelody",
    }),
    ...mapMutations("sessionStore", ["mutateDeleteInitiated"]),
    askToDelete() {
      if (!this.deleteInitiated) {
        // pause playback -- maybe not needed
      }
      this.mutateDeleteInitiated();
    },
  },
};
</script>
