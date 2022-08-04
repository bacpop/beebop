<template>
  <div class="start-analysis">
    <button :class="(!analysisStatus.submitted && allSketched) ? '' : 'disabled'"
    class="btn btn-block btn-standard"
    @click='onClick'>
      Start Analysis</button>
    <!--only adding this temporarily to have something testable for e2e tests-->
    <p class="status" v-if='analysisStatus.submitted'>{{analysisStatus}}</p>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { mapActions, mapMutations, mapState } from 'vuex';

export default defineComponent({
  name: 'StartButton',
  methods: {
    updateStatus() {
      const inter = setInterval(this.getStatus, 1000);
      this.setStatusInterval(inter);
    },
    stopUpdateStatus() {
      clearInterval(this.statusInterval);
    },
    ...mapMutations(['setStatus', 'setStatusInterval']),
    ...mapActions(['runPoppunk', 'getStatus', 'getAssignResult']),
    onClick() {
      this.runPoppunk();
      this.setStatus({ task: 'submitted', data: 'submitted' });
      this.updateStatus();
    },
  },
  computed: {
    allSketched() {
      let all = true;
      Object.keys(this.results.perIsolate).forEach((element: string) => {
        if (!this.results.perIsolate[element].sketch) {
          all = false;
        }
      });
      return all;
    },
    ...mapState(['analysisStatus', 'results', 'statusInterval']),
  },
  watch: {
    analysisStatus: {
      handler(newVal) {
        if (newVal.assign === 'finished') {
          this.getAssignResult();
        }
        if ((newVal.network === 'finished' || newVal.network === 'failed') && (newVal.microreact === 'finished' || newVal.microreact === 'failed')) {
          this.stopUpdateStatus();
        }
      },
      deep: true,
    },
  },
});
</script>
