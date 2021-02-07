<template>
  <div :class="['|', 'piano']">
    <div class="piano__content">
      <div class="piano__side-panel"></div>
      <div class="piano__main">
        <div class="piano__top-panel"></div>
        <piano-keyboard class="piano__keyboard"/>
      </div>
    </div>
  </div>
</template>

<script>
import PianoKeyboard from "./PianoKeyboard.vue";

export default {
  components: {
    PianoKeyboard,
  },
  name: "Piano",
};
</script>
