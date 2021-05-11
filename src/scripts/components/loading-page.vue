<template>
  <div class="loading-page">
    <Logo class="loading-page__logo | logo" />

    <!-- login form -->
    <form
      v-if="isSupportedBrowser"
      class="loading-page__login-form | login-form"
      ref="loginForm"
      @submit="login"
    >
      <div class="login-form__field">
        <EmailIcon class="login-form__field-icon" />
        <input
          class="login-form__field-input"
          type="text"
          ref="email"
          name="email"
          placeholder="Email address"
          @keyup="onEmailInputChange"
        />
      </div>
      <div class="login-form__field">
        <PassIcon class="login-form__field-icon" />
        <input
          class="login-form__field-input"
          type="password"
          name="password"
          ref="password"
          placeholder="Password"
          @keyup="onPasswordInputChange"
        />
      </div>
      <div class="login-form__message">
        {{ errorMessage }}
      </div>
      <div
        class="login-form__button"
        @click="login"
        :data-disabled="!isInputFilled"
      >
        Login
      </div>
    </form>

    <div v-else class="loading-page__unsupported-browser">
      The app currently is only supported with Google Chrome
    </div>

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
import { mapActions, mapGetters } from "vuex";

export default {
  name: "LoadingPage",
  components: {
    Logo,
    EmailIcon,
    PassIcon,
  },
  computed: {
    ...mapGetters(["user", "isLoggedIn"]),
    // loacl computed
    isSupportedBrowser() {
      return navigator.userAgent.indexOf("Chrome") > -1;
    },
    isInputFilled() {
      return this.emailGiven && this.passwordGiven;
    },
  },
  data() {
    return {
      errorMessage: null,
      errorMsgTimeout: '',
      emailGiven: false,
      passwordGiven: false,
    };
  },
  async mounted() {
    if(this.isLoggedIn) {
      this.$router.push("battle");
    } else {
      localStorage.removeItem('userToken');
    }
  },
  methods: {
    ...mapActions(["authenticate"]),
    async login() {
      if (!this.isInputFilled) return;
      this.errorMsgTimeout = null;
      this.errorMessage = '';

      // NOTE this is not the proper way, but for mock data I use it to acccelerate development
      // SHOULD NOT BE USED IN PRODUCTION
      let formData = new FormData(this.$refs.loginForm);
      // console.log(formData);
      let successFulLogin = await this.authenticate(formData);

      if (successFulLogin.success) {
        console.log("successful auth..");
        this.$router.push("battle");
      }
      else {
        // console.log("no login");
        this.errorMessage = "No user found or incorrect details";
        this.errorMsgTimeout = setTimeout(() => {
          this.errorMessage = '';
        }, 4000);
      }
    },
    onEmailInputChange(e) {
      if (this.validateEmail(e.target.value)) this.emailGiven = true;
      else this.emailGiven = false;
    },
    onPasswordInputChange(e) {
      if (e.target.value.length > 0) this.passwordGiven = true;
      else this.passwordGiven = false;
    },
    validateEmail(email) {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    },
  },
};
</script>
