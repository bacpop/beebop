<template>
  <div>
    <div class="tabs d-flex">
      <div class ="nav-col">
        <ul class="nav flex-column nav-tabs">
          <li
          v-for="item in uniqueClusters" :key="item"
          class="nav-item">
            <button class="nav-link no-transition"
            id="cluster-tabs"
            :class="item == selectedCluster ? 'active' : ''"
            :aria-selected="item == selectedCluster"
            @click="onInput(item)">
              Cluster {{item}}
            </button>
          </li>
          <li class="fill-container"> </li>
        </ul>
      </div>
      <div class="tab-content">
        <div
        class="tab-pane fade m-3"
        :class="item == selectedCluster ? 'active show' : ''"
        v-for="item in uniqueClusters" :key="item">
            <CytoscapeGraph
            class="cytoscape-graph"
            v-if="visitedTabs.includes(item)" :key="item"
            :cluster="item"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { mapGetters } from 'vuex';
import CytoscapeGraph from '@/components/CytoscapeGraph.vue';

export default defineComponent({
  name: 'NetworkVisualisations',
  props: ['firstCluster'],
  data() {
    return {
      visitedTabs: [this.firstCluster],
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
  },
  methods: {
    onInput(value: number) {
      this.selectedCluster = value;
      if (!this.visitedTabs.includes(value)) {
        this.visitedTabs.push(value);
      }
    },
  },
});
</script>
