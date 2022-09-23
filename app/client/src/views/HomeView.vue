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
    <NetworkVisualisations
    v-if='user && (analysisStatus.network ==="finished")'
    :firstCluster="uniqueClusters[0]"/>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { mapState, mapActions, mapGetters } from 'vuex';
import LoginPrompt from '@/components/LoginPrompt.vue';
import GreetingAndLogout from '@/components/GreetingAndLogout.vue';
import DropZone from '@/components/DropZone.vue';
import StartButton from '@/components/StartButton.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import ResultsTable from '@/components/ResultsTable.vue';
import NetworkVisualisations from '@/components/NetworkVisualisations.vue';

export default defineComponent({
  name: 'HomeView',
  components: {
    LoginPrompt,
    GreetingAndLogout,
    DropZone,
    StartButton,
    ProgressBar,
    ResultsTable,
    NetworkVisualisations,
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
    ...mapState(['user', 'results', 'submitStatus', 'analysisStatus']),
    ...mapGetters([
      'uniqueClusters',
    ]),
  },
});
</script>
