<template>
  <div>
    <MidiIcon class="icon-small" />
    <div class="button" @click="getMIDI()">Reconnect MIDI</div>
  </div>
</template>

<script>
// import MidiIcon from '../graphics/midi-controller.svg';
import MidiIcon from "../graphics/midi.svg";
import { mapGetters} from "vuex";

export default {
  name: "MidiController",
  components: {
    MidiIcon,
  },
  computed: {
    ...mapGetters("sessionStore", ["userTurn"]),
    ...mapGetters("instrumentStore", ["rangeStart", "rangeEnd"]),
    ...mapGetters("mainClockStore", ["currentMusicalTime", "isRunning"]),
  },
  methods: {
    /**
     * Debugging helper function
     */
    printNoteSignal(on_message, currentMusicalTime) {
      // print to console
      if (on_message)
        console.log(
          `%c note started at `,
          "background: #222; color: #bada55",
          JSON.stringify(currentMusicalTime)
        );
      else
        console.log(
          `%c note ended at `,
          "background: #222; color: red",
          JSON.stringify(currentMusicalTime)
        );
    },
  },
};
</script>
