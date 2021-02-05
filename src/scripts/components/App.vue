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
            <div
              v-for="n in 2"
              :key="`black-key-${n}`"
              class="piano-keyboard__black-key | black-key"
              :data-piano-black-key-index="n"
            >
              <div class="black-key__top"></div>
              <div class="black-key__front"></div>
            </div>
            <div
              v-for="n in 3"
              :key="`black-key-${n+3}`"
              class="piano-keyboard__black-key | black-key"
              :data-piano-black-key-index="n+3"
            >
              <div class="black-key__top"></div>
              <div class="black-key__front"></div>
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
