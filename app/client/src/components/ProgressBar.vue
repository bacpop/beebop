<template>
  <div>
    <b-progress :value="analysisProgress" :max="1" show-progress class="progress">
        <b-progress-bar :value="analysisProgress" class="progress-bar" :animated="animated">
        {{ (analysisProgress*100).toFixed(2) }}%
        </b-progress-bar>
    </b-progress>
  </div>
</template>

<script lang="ts">
import { mapGetters} from 'vuex';
import { BProgress, BProgressBar } from 'bootstrap-vue-3';

export default {
  name: 'ProgressBar',
  computed: {
    ...mapGetters([
      'analysisProgress',
    ]),
    animated() {
      return this.analysisProgress as unknown as number !== 1;
    },
  },
  components: {
    BProgress,
    BProgressBar,
  },
};
</script>
