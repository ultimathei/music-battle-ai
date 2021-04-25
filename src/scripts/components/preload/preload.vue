<template>
  <div class="| app-preload" :data-fadeout="magentaModel != null">
    <Logo class="app-preload__logo | logo" />
    <p class="app-preload__info">Loading AI model..</p>
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
  },
};
</script>
