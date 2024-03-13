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

const cyRef = ref<HTMLElement | null>(null);

onMounted(async () => {
  await graphml(cytoscape, jquery);
  cytoscape.use(graphml);
  const cy = cytoscape({
    container: cyRef.value as unknown as HTMLElement,
    style: [
      {
        selector: "node",
        style: {
          width: "10px",
          height: "10px",
          content: "data(key0)",
          "font-size": "7px",
          color: "#777",
          "background-color": "rgba(45, 212, 191, 0.44)"
        }
      },
      {
        selector: 'node[ref_query = "query"]',
        style: {
          "background-color": "crimson",
          color: "crimson"
        }
      },
      {
        selector: "edge",
        style: {
          width: "1px",
          "line-color": "palegoldenrod"
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
  });
});
</script>

<template>
  <div class="cytoscape-graph">
    <span class="text-color-secondary">Cluster: {{ props.cluster }}</span>
    <div class="cy shadow-4 border-round" ref="cyRef"></div>
  </div>
</template>

<style scoped>
.cy {
  width: 100%;
  height: 100%;
  flex-grow: 1;
  text-align: start;
  margin: auto;
}

.cytoscape-graph {
  gap: 0.25rem;
  max-height: 800px;
  min-height: 500px;
  min-width: 500px;
  display: flex;
  flex-direction: column;
}
</style>
