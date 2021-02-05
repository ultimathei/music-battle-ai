<template>
  <h1>{{ msg }}</h1>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "test",
  computed: {
      localComputed () {
          // ...
      },
      ...mapState([
        // mapping this.msg to store.state.msg
        "msg",
      ]),
  }
};
</script>
