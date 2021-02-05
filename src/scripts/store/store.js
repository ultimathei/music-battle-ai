import Vue from "vue";
import Vuex from "vuex";
import titleStore from "./modules/title-store";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    // registering all imported store modules ..
    titleStore,
  },

  // other, non module stores
  state: {},
  getters: {},
  // used for syncronous transactions
  mutations: {},
  // used for asyncronous transactions
  actions: {},
});
