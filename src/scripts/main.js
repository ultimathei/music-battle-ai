import Vue from "vue";
import App from "./components/App.vue";
import "../styles/site.scss";
import store from './store/store';
// import Tone from "tone";

new Vue({
  el: "#app",
  store,
  render: (h) => h(App),
});