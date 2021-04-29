<template>
  <div class="| app-preload" :data-fadeout="magentaModel != null">
    <Logo class="app-preload__logo | logo" />
    <p class="app-preload__info">{{midiStatusMsg}}</p>
    <p class="app-preload__info" v-if="magentaModel == null">Loading AI model..</p>
    <p class="app-preload__info" v-else>AI model loaded</p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Logo from "../graphics/logo.svg";

export default {
  name: "Preload",
  components: {
    Logo,

  },
  computed: {
    ...mapGetters("modelStore", ["magentaModel"]),
    ...mapGetters("midiStore", ["isMIDIready", "midiStatusMsg"]),
  },
};
</script>
