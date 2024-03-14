<script setup lang="ts">
import cytoscape from "cytoscape";
// @ts-expect-error no types for this package
import graphml from "cytoscape-graphml";
import jquery from "jquery";
import type { CyGraphml } from "@/types/projectTypes";
import { onMounted, ref } from "vue";

const props = defineProps<{
  graph: string;
  cluster: string;
}>();

const fullScreenVisible = ref(false);
</script>

<template>
  <Dialog v-model:visible="fullScreenVisible" modal>
    <template #header>
      <div class="inline-flex align-items-center justify-content-center gap-2">
        <span class="font-bold white-space-nowrap">Cluster: {{ props.cluster }}</span>
      </div>
    </template>
    <div class="fullscreen-cytoscape">
      <CytoscapeCanvas :graph="props.graph" />
    </div>
  </Dialog>
  <div class="cytoscape-graph">
    <div class="flex justify-content-between align-items-center">
      <span class="text-color-secondary">Cluster: {{ props.cluster }}</span>
      <Button
        v-tooltip.top="'Fullscreen'"
        text
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
.fullscreen-cytoscape {
  width: 1200px;
  height: 750px;
}
</style>
