<template>
  <div class='home'>
    <h1>Welcome to beebop!</h1>
    <div v-if='user' class='auth'>
      <LoginPrompt v-if='!loggedIn' />
      <GreetingAndLogout v-if='loggedIn' />
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'vuex';
import LoginPrompt from '@/components/LoginPrompt.vue';
import GreetingAndLogout from '@/components/GreetingAndLogout.vue';

export default defineComponent({
  name: 'HomeView',
  components: {
    LoginPrompt,
    GreetingAndLogout,
  },
  mounted() {
    this.getUser();
  },
  methods: {
    ...mapActions(['getUser']),
  },
  computed: {
    loggedIn() {
      return this.user.status === 'success';
    },
    ...mapState(['user']),
  },
});
</script>
