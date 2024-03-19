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
    <CytoscapeCanvas :graph="props.graph" />
  </Sidebar>
  <div class="cytoscape-graph">
    <div class="flex justify-content-between align-items-center">
      <span class="text-color-secondary">Cluster: {{ props.cluster }}</span>
      <Button
        v-tooltip.top="'Fullscreen'"
        outlined
        icon="pi pi-window-maximize"
        aria-label="Fullscreen"
        @click="fullScreenVisible = true"
      />
    </div>
    <CytoscapeCanvas :graph="props.graph" />
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
