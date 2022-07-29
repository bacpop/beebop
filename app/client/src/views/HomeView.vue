<template>
  <div class='home'>
    <h1>Welcome to beebop!</h1>
    <div v-if='user' class='auth'>
      <LoginPrompt v-if='!loggedIn' />
      <GreetingAndLogout v-if='loggedIn' />
    </div>
    <DropZone v-if='user && loggedIn' />
    <StartButton v-if='user && loggedIn && filesUploaded' />
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'vuex';
import LoginPrompt from '@/components/LoginPrompt.vue';
import GreetingAndLogout from '@/components/GreetingAndLogout.vue';
import DropZone from '@/components/DropZone.vue';
import StartButton from '@/components/StartButton.vue';

export default defineComponent({
  name: 'HomeView',
  components: {
    LoginPrompt,
    GreetingAndLogout,
    DropZone,
    StartButton,
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
    filesUploaded() {
      return Object.keys(this.results.perIsolate).length > 0;
    },
    ...mapState(['user', 'results']),
  },
});
</script>
