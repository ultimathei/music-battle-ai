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
      <div class="page-profile__item-value">Mate</div>
    </div>
    <div class="page-profile__item">
      <div class="page-profile__item-key">Email</div>
      <div class="page-profile__item-value">
        krisztian.mate.design@gmail.com
      </div>
    </div>
    <div class="page-profile__item">
      <div class="page-profile__item-key">Member since</div>
      <div class="page-profile__item-value">01/12/21</div>
    </div>
    <div class="page-profile__item">
      <div class="page-profile__item-key">Level</div>
      <div class="page-profile__item-value">PRO</div>
    </div>
    <div class="page-profile__item">
      <div class="page-profile__item-key">All time score</div>
      <div class="page-profile__item-value">100009999</div>
    </div>
    <div class="page-profile__item">
      <div class="page-profile__item-button">
        <span>Request password change</span>
      </div>
    </div>
  </div>
</template>

<script>
import UserIcon from "../graphics/user.svg";

export default {
  name: "ProfilePage",
  components:{
    UserIcon,
  },
};
</script>
