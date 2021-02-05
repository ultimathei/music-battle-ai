<template>
  <div id="app">
    <test></test>
    <div class="piano">
      <div class="piano__side-panel"></div>
      <div class="piano__main">
        <div class="piano__top-panel"></div>
        <div class="piano__keyboard | piano-keyboard">
          <div class="piano-keyboard__white-keys">
            <piano-white-key
              v-for="n in 8"
              :key="n"
              class="piano-keyboard__white-key"
            ></piano-white-key>
          </div>
          <div class="piano-keyboard__black-keys">
            <div class="piano-keyboard__black-key">
              
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import test from "./test/Test.vue";
import PianoWhiteKey from "./piano/PianoWhiteKey.vue";

export default {
  components: { test, PianoWhiteKey },
  name: "app",
};
</script>
