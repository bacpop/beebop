<template>
  <div>
    <b-progress :value="analysisProgress.progress" :max="1" show-progress class="progress">
        <b-progress-bar
        :value="analysisProgress.progress"
        class="progress-bar"
        :animated="animated">
          {{ (analysisProgress.progress*100).toFixed(2) }}%
        </b-progress-bar>
    </b-progress>
    Completed {{ analysisProgress.finished }} of {{ analysisProgress.total }} jobs.
  </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { BProgress, BProgressBar } from 'bootstrap-vue-3';

export default {
  name: 'ProgressBar',
  computed: {
    ...mapGetters([
      'analysisProgress',
    ]),
    animated(): boolean {
      return (this.analysisProgress as unknown as Record<string, number>).progress !== 1;
    },
  },
  components: {
    BProgress,
    BProgressBar,
  },
};
</script>
