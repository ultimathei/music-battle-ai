<template>
  <div :class="['|', 'piano-keyboard']">
    <div class="piano-keyboard__white-keys">
      <piano-white-key
        v-for="n in [0,2,4,5,7,9,11,12]"
        :key="n"
        class="piano-keyboard__white-key"
        :data-note-index="60+n"
        :ref="60+n"
      ></piano-white-key>
    </div>
    <div class="piano-keyboard__black-keys">
      <piano-black-key
        v-for="n of [1,3,6,8,10]"
        :key="`black-key-${n}`"
        class="piano-keyboard__black-key"
        :data-piano-black-key-index="n"
        :data-note-index="60+n"
        :ref="60+n"
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
