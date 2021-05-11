import Vue from "vue";
import VueRouter from "vue-router";
import App from "./components/App.vue";
import LoadingPage from "./components/loading-page.vue";
import "../styles/site.scss";
import store from "./store/store";
// import Tone from "tone";

Vue.use(VueRouter);

// define possible routes
const routes = [
  { path: "/", component: LoadingPage , meta: { requiresVisitor: true }},
  { path: "/battle", component: App, meta: { requiresAuth: true } },
];

// define router
const router = new VueRouter({
  routes,
});

// from vue documentation https://router.vuejs.org/guide/advanced/meta.html
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // this route requires auth, check if logged in
    // if not, redirect to login page.
    if (!store.getters.isLoggedIn) {
      next({
        path: '/',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next() // make sure to always call next()!
  }
})

// route it
const app = new Vue({
  router,
  store
}).$mount('#app');
