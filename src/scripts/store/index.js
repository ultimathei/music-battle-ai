import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  // registering all imported store modules
  modules: {},

  state: {
    msg: "Music Battle Ai",
  },

  getters: {
    msg(state) {
      return state.msg;
    },
  },

  mutations: {
    SET_MSG(state, data) {
      state.msg = data;
    },
  },

  actions: {
    setMsg({ commit }, msg) {
      commit("SET_MSG", msg);
    },
  },
});
