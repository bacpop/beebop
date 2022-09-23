<template>
  <button
  @click='onClick()'
  class="btn btn-block btn-standard btn-download">
    Download files as .zip
  </button>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'vuex';

export default defineComponent({
  name: 'DownloadMicroreactZip',
  props: ['type', 'cluster'],
  methods: {
    ...mapActions(['getZip']),
    async onClick() {
      this.getZip({ type: this.type, cluster: this.cluster });
    },
  },
  computed: {
    ...mapState(['projectHash']),
  },
});
</script>
