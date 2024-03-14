<script setup lang="ts">
import cytoscape from "cytoscape";
// @ts-expect-error no types for this package
import graphml from "cytoscape-graphml";
import jquery from "jquery";
import type { CyGraphml } from "@/types/projectTypes";
import { onMounted, ref } from "vue";

const props = defineProps<{
  graph: string;
}>();

const cyRef = ref<HTMLElement | null>(null);

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
          content: "data(key0)",
          "font-size": "7px",
          color: "#00CC66",
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
  });
});
</script>

<template>
  <div class="shadow-5 border-round w-full h-full m-auto flex-grow-1 text-left" ref="cyRef"></div>
</template>
