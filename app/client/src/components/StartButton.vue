<template>
  <div class="startAnalysis">
    <button v-if='!analysisStatus' class="btn btn-block btn-standard"
    @click='runPoppunk();setStatus("submitted");updateStatus()'>
      Start Analysis</button>
    <button v-if='analysisStatus' class="btn btn-block btn-disabled">
      Start Analysis</button>
    <h5 v-if='analysisStatus'>Job status: {{analysisStatus}}</h5>
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
    ...mapActions(['runPoppunk', 'getStatus', 'getResult']),
  },
  computed: {
    ...mapState(['analysisStatus', 'statusInterval']),
  },
  watch: {
    analysisStatus(val) {
      if (val === 'finished') {
        this.stopUpdateStatus();
        this.getResult();
      }
    },
  },
});
</script>
