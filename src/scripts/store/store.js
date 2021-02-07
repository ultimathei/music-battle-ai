import Vue from "vue";
import Vuex from "vuex";
import titleStore from "./modules/title-store";
import pianoStore from "./modules/piano-store";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    // registering all imported store modules ..
    titleStore,
    pianoStore,
  },

  // other, non module stores
  state: {},
  getters: {},
  // used for syncronous transactions
  mutations: {},
  // used for asyncronous transactions
  actions: {},
});
