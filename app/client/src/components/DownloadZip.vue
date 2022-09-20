<template>
  <button
  @click='onClick()'
  class="btn btn-block btn-standard btn-download">
    Download zip file
  </button>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { mapGetters, mapState, mapActions } from 'vuex';

export default defineComponent({
  name: 'DownloadZip',
  props: ['type', 'cluster'],
  methods: {
    ...mapActions(['getZip']),
    async onClick() {
      this.getZip({ type: this.type, cluster: this.cluster });
    },
  },
  computed: {
    ...mapGetters([
      'uniqueClusters',
    ]),
    ...mapState(['projectHash']),
  },
});
</script>
