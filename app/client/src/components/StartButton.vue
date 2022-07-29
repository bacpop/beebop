<template>
  <div class="start-analysis">
    <button v-if='!analysisStatus.submitted && allSketched' class="btn btn-block btn-standard"
    @click='runPoppunk();setStatus({ task: "submitted", data: "submitted"})'>
      Start Analysis</button>
    <button v-else class="btn btn-block btn-disabled">
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
    ...mapMutations(['setStatus']),
    ...mapActions(['runPoppunk']),
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
    ...mapState(['analysisStatus', 'results']),
  },
});
</script>
