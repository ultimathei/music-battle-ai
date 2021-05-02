<template>
  <div :class="'| menu'">
    <div
      class="menu__item"
      @click="goToPage('battle')"
      :data-active="currentPageOpen == 'battle'"
    >
      Battleground
    </div>
    <div
      class="menu__item"
      @click="goToPage('profile')"
      :data-active="currentPageOpen == 'profile'"
    >
      Profile & settings
    </div>
    <div
      class="menu__item"
      @click="goToPage('battles')"
      :data-active="currentPageOpen == 'battles'"
    >
      My saved battles
    </div>
    <div
      class="menu__item"
      @click="goToPage('scoreboard')"
      :data-active="currentPageOpen == 'scoreboard'"
    >
      Scoreboard
    </div>
    <div class="menu__item" @click="goToPage('logout')">Logout</div>
  </div>
</template>

<script>
import { mapMutations, mapGetters } from "vuex";
import {
  MUT_clockAudioContext,
} from "../../store/mutations";

export default {
  name: "Menu",
  computed: {
    ...mapGetters(["currentPageOpen"]),
  },
  methods: {
    ...mapMutations("mainClockStore", [MUT_clockAudioContext]),
    ...mapMutations("midiStore", ["removeMidiAccess"]),
    ...mapMutations(["mutateIsMenuOpen", "mutateCurrentPageOpen"]),
    
    // local computed
    goToPage(name) {
      if (name == "logout") {
        localStorage.removeItem("userToken");
        this[MUT_clockAudioContext](null);
        this.removeMidiAccess();
        this.mutateIsMenuOpen(false);
        this.mutateCurrentPageOpen("battle");
        this.$router.push("/");
      } else {
        this[MUT_clockAudioContext](null);
        this.mutateCurrentPageOpen(name);
        this.mutateIsMenuOpen(false);
      }
    },
  },
};
</script>
