<template>
  <div class="app">
    <Preload
      class="app__preload"
      v-if="!fadeoutComplete"
      :data-fadeout="isPreloaded"
    />

    <template v-if="magentaModel">
      <Header />
      <Menu class="app__menu" v-if="isMenuOpen" />

      <ProfilePage class="app__page" v-if="currentPageOpen == 'profile'" />
      <BattlesPage class="app__page" v-if="currentPageOpen == 'battles'" />
      <ScoreBoardPage
        class="app__page"
        v-if="currentPageOpen == 'scoreboard'"
      />
      <BattlePage class="app__body" v-if="currentPageOpen == 'battle'" />

      <Footer class="app__footer" v-if="currentPageOpen != 'battles'" />
    </template>
  </div>
</template>

<script>
import Header from "./header/header.vue";
import Footer from "./footer/footer.vue";
import Preload from "./preload/preload.vue";
import Menu from "./menu/menu.vue";
import ProfilePage from "./pages/profile.vue";
import BattlesPage from "./pages/battles.vue";
import BattlePage from "./pages/battle.vue";
import ScoreBoardPage from "./pages/scoreboard.vue";

import { mapActions, mapGetters } from "vuex";
import { ACT_modelInitVae } from "../store/actions";

export default {
  name: "app",
  components: {
    Preload,
    Header,
    Menu,
    ProfilePage,
    BattlesPage,
    BattlePage,
    ScoreBoardPage,
    Footer,
  },
  data() {
    return {
      fadeoutComplete: false,
    };
  },
  watch: {
    // can I get rid of the watcher?
    isPreloaded(newVal) {
      if (newVal == true) {
        setTimeout(() => {
          this.fadeoutComplete = true;
        }, 1500);
      }
    },
  },
  computed: {
    ...mapGetters(["user", "mode", "isMenuOpen", "currentPageOpen"]),
    ...mapGetters("modelStore", ["magentaModel", "isModelReady"]),
    ...mapGetters("mainClockStore", [
      "isRunning",
      "currentBar",
      "currentDemisemiquaver",
      "metronomeSoundOn",
      "metronomeFlashActive",
      "audioContext",
    ]),
    ...mapGetters("sessionStore", ["deleteInitiated"]),
    ...mapGetters("instrumentStore", ["rangeStart", "rangeEnd"]),
    ...mapGetters("midiStore", ["isMIDIready"]),

    // local computed
    isPreloaded() {
      // add more guards & conditions?
      return this.user && this.isModelReady && this.isMIDIready;
    },
  },
  async mounted() {
    let token = localStorage.getItem("userToken");
    if (!token) {
      this.$router.push("/");
      return;
    }

    const response = await this.findUserByToken(token);
    if (!response.success) {
      localStorage.removeItem("userToken");
      this.$router.push("/");
      return;
    }

    this.getMIDI();
    this[ACT_modelInitVae](this.rangeStart, this.rangeEnd);
  },
  methods: {
    ...mapActions(["findUserByToken"]),
    ...mapActions("modelStore", [ACT_modelInitVae]),
    ...mapActions("midiStore", ["getMIDI"]),
  },
};
</script>
