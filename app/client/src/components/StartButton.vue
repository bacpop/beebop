<template>
  <div class="start-analysis">
    <button :class="(!submitStatus && allSketched) ? '' : 'disabled'"
    class="btn btn-block btn-standard"
    @click='onClick'>
      Start Analysis</button>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { mapActions, mapState } from 'vuex';

export default defineComponent({
  name: 'StartButton',
  methods: {
    ...mapActions(['submitData']),
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
    ...mapState(['submitStatus', 'analysisStatus', 'results']),
  },
});
</script>
