<template>
  <div>
    <h1>{{ title }}</h1>
    <button @click="changeTitle('Changed title')">click</button>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { TITLE_ACTION } from "../../store/actions";

export default {
  name: "test",
  computed: {
    localComputed() {
      // ...
    },
    ...mapState("titleStore", {
      title: (state) => state.title,
    }),
  },
  methods: {
    ...mapActions("titleStore", {
      changeTitle: TITLE_ACTION,
    }),
  },
};
</script>
