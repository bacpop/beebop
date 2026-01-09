<script setup lang="ts">
import { DARK_THEME, useTheme } from "@/composables/useTheme";
import type { LocationMetadata } from "@/stores/speciesStore";
import { displayLocationSamples, setTileLayer } from "@/utils/metadata";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { onMounted, onUnmounted, ref, watch, type Ref } from "vue";

const { locationMetadata } = defineProps<{
  locationMetadata: LocationMetadata[];
}>();
const { themeState } = useTheme();
const map = ref<L.Map | null>(null);

onMounted(() => {
  map.value = L.map("map", { zoomSnap: 0.1 });

  setTileLayer(themeState.value === DARK_THEME, map as Ref<L.Map>);
  displayLocationSamples(map as Ref<L.Map>, locationMetadata);
});

onUnmounted(() => {
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
});

watch(themeState, async (newTheme) => {
  setTileLayer(newTheme === DARK_THEME, map as Ref<L.Map | null>);
});
</script>

<template>
  <div class="map-container">
    <div id="map"></div>
  </div>
</template>

<style scoped>
.map-container {
  border: 2px solid var(--surface-border);
  border-radius: var(--border-radius);
  flex-grow: 1;
  padding: 8px;
}
#map {
  height: 100%;
  width: 100%;
  border: 3px solid var(--surface-border);
  border-radius: var(--border-radius);
}
</style>
