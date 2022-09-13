<template>
  <div class='home'>
    <h1>Welcome to beebop!</h1>
    <div class='auth'>
      <LoginPrompt v-if='!user' />
      <GreetingAndLogout v-if='user' />
    </div>
    <DropZone v-if='user && !submitStatus' />
    <StartButton v-if='user && filesUploaded' />
    <ProgressBar v-if='user && filesUploaded && submitStatus' />
    <ResultsTable v-if='user && filesUploaded' class='table'/>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'vuex';
import LoginPrompt from '@/components/LoginPrompt.vue';
import GreetingAndLogout from '@/components/GreetingAndLogout.vue';
import DropZone from '@/components/DropZone.vue';
import StartButton from '@/components/StartButton.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import ResultsTable from '@/components/ResultsTable.vue';

export default defineComponent({
  name: 'HomeView',
  components: {
    LoginPrompt,
    GreetingAndLogout,
    DropZone,
    StartButton,
    ProgressBar,
    ResultsTable,
  },
  mounted() {
    this.getUser();
  },
  methods: {
    ...mapActions(['getUser']),
  },
  computed: {
    filesUploaded() {
      return Object.keys(this.results.perIsolate).length > 0;
    },
    ...mapState(['user', 'results', 'submitStatus']),
  },
});
</script>
