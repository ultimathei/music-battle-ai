<template>
  <div id="app" class="app">
    <!-- <test></test> -->
    <h1 class="app__header">Music Battle Ai v.1.0</h1>
    <piano></piano>
    <p class="app__footer">created by Mate Krisztian for the final year project QMUL @ 2021</p>
  </div>
</template>

<script>
// import test from "./test/Test.vue";
import Piano from "./piano/Piano.vue";

export default {
  components: {
    // test,
    Piano,
  },
  name: "app",
};
</script>
