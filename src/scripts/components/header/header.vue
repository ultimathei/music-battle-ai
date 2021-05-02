<template>
  <div class="app__header | app-header">
    <div class="app-header__menu" @click="switchMenu">
      <MenuIcon v-if="!isMenuOpen" />
      <MenuIconCloser v-else />
    </div>
    <div class="app-header__logo | logo">
      <Logo />
    </div>
    <div class="app-header__controls">
      <div class="metronome__details">
        {{ currentBar + 1 }} / {{ Math.floor(currentDemisemiquaver / 8) + 1 }}/4
      </div>
      <div
        class="metronome__flash"
        :data-active="metronomeFlashActive"
        ref="metronome_flash"
      ></div>
      <MetronomeIcon
        class="metronome__button"
        @click="switchMetronome"
        :data-active="metronomeSoundOn"
      />
    </div>
  </div>
</template>

<script>
import Logo from "../graphics/logo.svg";
import MenuIcon from "../graphics/menu.svg";
import MenuIconCloser from "../graphics/menu_close_2.svg";
import MetronomeIcon from "../graphics/metronome.svg";

import { mapActions, mapGetters, mapMutations } from "vuex";
import { ACT_clockStop } from "../../store/actions";
import { MUT_clockMetronomeSoundOn } from "../../store/mutations";

export default {
  name: "Header",
  components: {
    Logo,
    MenuIcon,
    MenuIconCloser,
    MetronomeIcon,
  },
  computed: {
    ...mapGetters(["isMenuOpen"]),
    ...mapGetters("mainClockStore", [
      "currentBar",
      "currentDemisemiquaver",
      "metronomeSoundOn",
      "metronomeFlashActive",
    ]),

    // local computed
  },
  methods: {
    ...mapMutations(["mutateIsMenuOpen"]),
    ...mapActions("mainClockStore", [ACT_clockStop]),
    ...mapMutations("mainClockStore", [MUT_clockMetronomeSoundOn]),

    switchMetronome() {
      this[MUT_clockMetronomeSoundOn](!this.metronomeSoundOn);
    },

    switchMenu() {
      if (this.isMenuOpen) {
        this.mutateIsMenuOpen(false);
      } else {
        // stop playback
        this[ACT_clockStop]();
        this.mutateIsMenuOpen(true);
      }
    },
  },
};
</script>
