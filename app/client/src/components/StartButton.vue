<template>
  <div class="start-analysis">
    <button :class="(!submitStatus && allSketched) ? '' : 'disabled'"
    class="btn btn-block btn-standard"
    @click='onClick'>
      Start Analysis</button>
    <!--only adding this temporarily to have something testable for e2e tests-->
    <p class="status" v-if='submitStatus'>{{analysisStatus}}</p>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { mapActions, mapMutations, mapState } from 'vuex';

export default defineComponent({
  name: 'StartButton',
  methods: {
    ...mapMutations(['setSubmitStatus']),
    ...mapActions(['runPoppunk', 'startStatusPolling', 'submitData']),
    onClick() {
      this.submitData();
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
    ...mapState(['submitStatus', 'analysisStatus', 'results', 'statusInterval']),
  },
});
</script>
