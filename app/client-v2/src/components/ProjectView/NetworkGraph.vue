<script setup lang="ts">
import { ref } from "vue";
import CytoscapeCanvas from "./CytoscapeCanvas.vue";
import type { GraphMLKeys } from "@/utils/graph";
defineProps<{
  graph: string;
  cluster: string;
  graphMLKeys: GraphMLKeys;
}>();

const fullScreenVisible = ref(false);
</script>

<template>
  <Sidebar v-model:visible="fullScreenVisible" :header="`Cluster: ${cluster}`" position="full">
    <CytoscapeCanvas :graph="graph" :cluster="cluster" isFullScreen :graphMLKeys="graphMLKeys" />
  </Sidebar>
  <div class="cytoscape-graph">
    <CytoscapeCanvas
      :cluster="cluster"
      :graph="graph"
      @onFullScreen="fullScreenVisible = true"
      :graphMLKeys="graphMLKeys"
    />
  </div>
</template>

<style scoped>
.cytoscape-graph {
  max-height: 800px;
  min-height: 500px;
  min-width: 500px;
  display: flex;
  flex-direction: column;
}
</style>
