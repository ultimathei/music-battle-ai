<template>
  <div class="loading-page">
    <Logo class="loading-page__logo | logo" />

    <!-- login form -->
    <form
      v-if="isSupportedBrowser"
      class="loading-page__login-form | login-form"
    >
      <div class="login-form__field">
        <EmailIcon class="login-form__field-icon" />
        <input
          class="login-form__field-input"
          type="text"
          placeholder="Email address"
        />
      </div>
      <div class="login-form__field">
        <PassIcon class="login-form__field-icon" />
        <input
          class="login-form__field-input"
          type="password"
          placeholder="Password"
        />
      </div>
      <div
        class="login-form__button"
        @click="goToRoute"
        :data-disabled="!inputFilled"
      >
        Login
      </div>
    </form>

    <div v-else class="loading-page__unsupported-browser">
      The app currently is only supported with Google Chrome
    </div>

    <!-- <div @click="goToRoute">Go to Battle</div> -->

    <div class="loading-page__credits | credits">
      <p class="credits__text">Photo by</p>
      <a
        class="credits__link"
        href="https://unsplash.com/@beeford?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
        >Brandon Erlinger-Ford</a
      >
      <p class="credits__text">on</p>
      <a
        class="credits__link | credits__link--main"
        href="https://unsplash.com/s/photos/rap-concert?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
        >Unsplash</a
      >
    </div>
  </div>
</template>

<script>
import Logo from "./graphics/logo.svg";
import EmailIcon from "./graphics/email.svg";
import PassIcon from "./graphics/password.svg";

export default {
  name: "LoadingPage",
  components: {
    Logo,
    EmailIcon,
    PassIcon,
  },
  computed: {
    isSupportedBrowser(){
      return navigator.userAgent.indexOf("Chrome") > -1;
    }
  },
  data() {
    return {
      inputFilled: true, // set this dynamically
    };
  },
  methods: {
    goToRoute() {
      this.$router.push("battle");
    },
  },
};
</script>
