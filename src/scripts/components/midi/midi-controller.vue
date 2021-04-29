<template>
  <div>
    <MidiIcon class="icon-small" />
    <div class="button" @click="getMIDI()">Reconnect MIDI</div>
  </div>
</template>

<script>
// import MidiIcon from '../graphics/midi-controller.svg';
import MidiIcon from "../graphics/midi.svg";

export default {
  name: "MidiController",
  components: {
    MidiIcon,
  },
};
</script>
