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
  { path: "/", component: LoadingPage },
  { path: "/battle", component: App },
];

// define router
const router = new VueRouter({
  routes,
});

// route it
const app = new Vue({
  router,
  store
}).$mount('#app');
