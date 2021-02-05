/**
 * Store module for the title
 */
import { TITLE_MUTATION } from "../mutations";
import { TITLE_ACTION } from "../actions";

export default {
  namespaced: true,
  state: () => ({
    title: "Music Battle Ai",
  }),

  getters: {
    title(state) {
      return state.title;
    },
  },

  mutations: {
    // using the ES2015 computed property name feature
    // to use a constant as the function name
    [TITLE_MUTATION](state, data) {
      state.title = data;
    },
  },

  actions: {
    [TITLE_ACTION]({ commit }, title) {
      commit(TITLE_MUTATION, title);
    },
  },
};
