<template>
  <div :class="'| page-profile'">
    <div class="page-profile__item">
      <div class="page-profile__item-avatar">
        <div class="page-profile__item-avatar-photo">
          <UserIcon />
        </div>
      </div>
    </div>
    <div class="page-profile__item">
      <div class="page-profile__item-key">Name</div>
      <div class="page-profile__item-value">{{name}}</div>
    </div>
    <div class="page-profile__item">
      <div class="page-profile__item-key">Email</div>
      <div class="page-profile__item-value">
        {{email}}
      </div>
    </div>
    <div class="page-profile__item">
      <div class="page-profile__item-key">Member since</div>
      <div class="page-profile__item-value">{{member_since}}</div>
    </div>
    <div class="page-profile__item">
      <div class="page-profile__item-key">Level</div>
      <div class="page-profile__item-value">{{level}}</div>
    </div>
    <div class="page-profile__item">
      <div class="page-profile__item-key">All time score</div>
      <div class="page-profile__item-value">{{all_time_score}}</div>
    </div>
    <!-- <div class="page-profile__item">
      <div class="page-profile__item-button">
        <span>Request password change</span>
      </div>
    </div> -->
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import UserIcon from "../graphics/user.svg";
import {getDate} from '../../utils/utils';

export default {
  name: "ProfilePage",
  components: {
    UserIcon,
  },
  data() {
    return {
      name: '-',
      email: '-',
      member_since: '-',
      level: '-',
      all_time_score: 0,
    }
  },
  async mounted() {
    const profile = await this.getProfileDetails();
    console.log(profile);
    this.name = profile.user.username;
    this.email = profile.user.email;
    this.member_since = getDate(profile.user.created_at);
    this.level = profile.level;
    this.all_time_score = profile.all_time_score;
  },
  methods: {
    ...mapActions(["getProfileDetails"]),
  },
};
</script>
