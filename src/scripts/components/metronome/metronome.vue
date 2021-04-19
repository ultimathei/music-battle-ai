<template>
  <div>
    <MetronomeIcon class="icon-small" />
    <div class="metronome__details">
      {{ currentPatternInd + 1 }}/{{ currentBar + 1 }}
      {{ Math.floor(currentDemisemiquaver / 8) + 1 }}/4
    </div>
    <!-- <div class="playback_control" v-if="currentPatternInd > 0">
      <PauseIcon v-if="isRunning" @click="startStop" />
      <PlayIcon v-else @click="startStop" />
    </div> -->
    <div class="playback_control">
      <PauseIcon v-if="isRunning" @click="startStop" />
      <RecordIcon v-else @click="startStop" />
    </div>
    <div class="playback_control">
      <RestartIcon @click="backToStart" />
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
import MetronomeIcon from "../graphics/metronome.svg";
import PauseIcon from "../graphics/pause.svg";
import PlayIcon from "../graphics/play.svg";
import RecordIcon from "../graphics/record.svg";
import RestartIcon from "../graphics/restart.svg";
import {
  CLOCK_ACTION_STARTSTOP,
  CLOCK_ACTION_RESET,
} from "../../store/actions";

export default {
  name: "Metronome",
  components: {
    MetronomeIcon,
    PauseIcon,
    PlayIcon,
    RestartIcon,
    RecordIcon,
  },
  computed: {
    ...mapGetters("mainClockStore", [
      "currentBar",
      "currentDemisemiquaver",
      "currentPatternInd",
      "isRunning",
      "soundOn",
      "tempo",
      "precountDemisemiquaver",
    ]),
  },
  methods: {
    ...mapActions("mainClockStore", {
      'startStop': CLOCK_ACTION_STARTSTOP,
      'backToStart': CLOCK_ACTION_RESET,
    }),
  },
};
</script>
