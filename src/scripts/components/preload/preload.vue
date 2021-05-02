<template>
  <div class="| app-preload" :data-fadeout="modelMessage == 'AI model loaded'">
    <Logo class="app-preload__logo | logo" />
    <p class="app-preload__info">{{ midiStatusMsg }}</p>
    <p class="app-preload__info">{{ modelMessage }}</p>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Logo from "../graphics/logo.svg";

export default {
  name: "Preload",
  components: {
    Logo,
  },
  computed: {
    ...mapGetters("modelStore", ["magentaModel", "modelMessage"]),
    ...mapGetters("midiStore", ["isMIDIready", "midiStatusMsg"]),
  },
};
</script>
