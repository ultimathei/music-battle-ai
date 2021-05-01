<template>
  <div
    :class="`sequencer-item`"
    :data-sequence-list-item-type="type"
  >
    <div class="sequencer-item__index">{{ index }}</div>
    <RobotIcon v-if="type=='robot'" class="sequencer-item__icon" />
    <UserIcon v-else class="sequencer-item__icon" />
  </div>
</template>

<script>
import UserIcon from "../graphics/user.svg";
import RobotIcon from "../graphics/robot.svg";
export default {
  name: "SequencerItem",
  components: {
    UserIcon,
    RobotIcon,
  },
  props:{
    type: String,
    index: String,
  },
};
</script>
