<script setup lang="ts">
import { ref } from "vue";
import CytoscapeCanvas from "./CytoscapeCanvas.vue";
const props = defineProps<{
  graph: string;
  cluster: string;
}>();

const fullScreenVisible = ref(false);
</script>

<template>
  <Sidebar v-model:visible="fullScreenVisible" :header="`Cluster: ${props.cluster}`" position="full">
    <CytoscapeCanvas :graph="props.graph" :cluster="props.cluster" isFullScreen />
  </Sidebar>
  <div class="cytoscape-graph">
    <CytoscapeCanvas :cluster="props.cluster" :graph="props.graph" @onFullScreen="fullScreenVisible = true" />
  </div>
</template>

<style scoped>
.cytoscape-graph {
  gap: 0.25rem;
  max-height: 800px;
  min-height: 500px;
  min-width: 500px;
  display: flex;
  flex-direction: column;
}
</style>
