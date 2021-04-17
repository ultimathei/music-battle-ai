import Vue from "vue";
import Vuex from "vuex";
import pianoStore from "./modules/piano-store";
import mainClockStore from "./modules/main-clock-store";
import sessionStore from "./modules/session-store";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    // registering all imported store modules ..
    pianoStore,
    mainClockStore,
    sessionStore,
  },

  // other, non module stores if any
  state: {},
  getters: {},
  // used for syncronous transactions
  mutations: {},
  // used for asyncronous transactions
  actions: {},
});
