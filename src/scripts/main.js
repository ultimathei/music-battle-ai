import Vue from "vue";
import App from "./components/App.vue";
import "../styles/site.scss";
import store from './store';

new Vue({
  el: "#app",
  store,
  render: (h) => h(App),
});
