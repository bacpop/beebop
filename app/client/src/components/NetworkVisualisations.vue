<template>
  <div class="row">
    <div class="column10">
      <button v-for="item in uniqueClusters"
      class="btn btn-block btn-standard columnButtons"
      :class="item == selectedCluster ? 'selected' : ''"
      :key="item"
      @click="changeCluster(item)"
      >
        Cluster {{item}}
      </button>
    </div>
    <CytoscapeGraph class="column90" :key="selectedCluster" :cluster="selectedCluster"/>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { mapState, mapGetters } from 'vuex';
import CytoscapeGraph from '@/components/CytoscapeGraph.vue';

export default defineComponent({
  name: 'NetworkVisualisations',
  props: ['firstCluster'],
  data() {
    return {
      selectedCluster: this.firstCluster,
    };
  },
  components: {
    CytoscapeGraph,
  },
  computed: {
    ...mapGetters([
      'uniqueClusters',
    ]),
    ...mapState(['results']),
  },
  methods: {
    changeCluster(cluster: number) {
      this.selectedCluster = cluster;
    },
  },
});
</script>
