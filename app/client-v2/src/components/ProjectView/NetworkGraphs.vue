<script setup lang="ts">
import { extractGraphMLKeys } from "@/utils/graph";
import { computed } from "vue";
import NetworkGraph from "./NetworkGraph.vue";

const props = defineProps<{
  networkGraphs: Record<string, string>;
}>();
const graphMLKeys = computed(() => extractGraphMLKeys(Object.values(props.networkGraphs)[0]));
</script>

<template>
  <InlineMessage severity="info" class="mb-2"
    >These graphs are pruned versions of the full graphs. To view full graphs, download the zip file and view the
    .graphml externally.</InlineMessage
  >
  <InlineMessage severity="info" class="mb-2"
    >View in fullscreen, reset layout or use mouse, touchpad or touchscreen gestures on graphs to zoom in and out, or
    move nodes around.</InlineMessage
  >
  <div class="grid">
    <div v-for="(value, key) in props.networkGraphs" :key="key" class="col">
      <NetworkGraph :cluster="key" :graph="value" :graphMLKeys="graphMLKeys" />
    </div>
  </div>
</template>
