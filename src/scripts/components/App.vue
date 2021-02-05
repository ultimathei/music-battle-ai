<template>
  <div id="app">
    <test msg="Hello"></test>
  </div>
</template>

<script>
import test from './test/Test.vue';

export default {
  components: { test },
  name: "app",
};
</script>
