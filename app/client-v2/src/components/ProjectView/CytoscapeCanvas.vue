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
  isFullScreen?: boolean;
}>();
defineEmits<{
  onFullScreen: [];
}>();

const cyRef = ref<HTMLElement | null>(null);
const cystoscapeObj = ref<cytoscape.Core | null>(null);

onMounted(async () => {
  await graphml(cytoscape, jquery);

  const cy = cytoscape({
    container: cyRef.value as unknown as HTMLElement,
    style: [
      {
        selector: "node",
        style: {
          width: "10px",
          height: "10px",
          content: "data(key2)",
          "font-size": "7px",
          color: "#00CC66",
          "background-color": "rgba(45, 212, 191, 0.44)"
        }
      },
      {
        selector: 'node[key3 = "query"]',
        style: {
          "background-color": "crimson",
          color: "crimson"
        }
      },
      {
        selector: "edge",
        style: {
          width: "1px",
          "line-color": "palegoldenrod",
          opacity: 0.5
        }
      }
    ],
    layout: {
      name: "grid"
    }
  });
  cy.ready(() => {
    (cy as CyGraphml).graphml({ layoutBy: "cose" });
    (cy as CyGraphml).graphml(props.graph);
    cystoscapeObj.value = cy;
  });
});
</script>

<template>
  <div class="flex justify-content-between align-items-center mb-1">
    <span class="text-color-secondary">Cluster: {{ props.cluster }}</span>
    <div>
      <Button
        @click="cystoscapeObj?.fit()"
        outlined
        icon="pi pi-refresh"
        v-tooltip.top="'Reset Layout'"
        aria-label="Reset Layout"
        size="small"
        class="mr-1"
      />
      <Button
        v-if="!props.isFullScreen"
        v-tooltip.top="'Fullscreen'"
        outlined
        icon="pi pi-window-maximize"
        aria-label="Fullscreen"
        @click="$emit('onFullScreen')"
        size="small"
      />
    </div>
  </div>
  <div class="shadow-5 border-round w-full h-full m-auto flex-grow-1 text-left" ref="cyRef"></div>
</template>
