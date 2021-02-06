<template>
  <div :class="['|', 'piano-keyboard']">
    <div class="piano-keyboard__white-keys">
      <piano-white-key
        v-for="n in 8"
        :key="n"
        class="piano-keyboard__white-key"
      ></piano-white-key>
    </div>
    <div class="piano-keyboard__black-keys">
      <piano-black-key
        v-for="n of [1,2,4,5,6]"
        :key="`black-key-${n}`"
        class="piano-keyboard__black-key"
        :data-piano-black-key-index="n"
      />
    </div>
  </div>
</template>

<script>
import PianoWhiteKey from "./PianoWhiteKey.vue";
import PianoBlackKey from "./PianoBlackKey.vue";

export default {
  components: { PianoWhiteKey, PianoBlackKey },
  name: "PianoKeyboard",
};
</script>
