<script setup lang="ts">
import { DARK_THEME, useTheme } from "@/composables/useTheme";
import { useSpeciesStore } from "@/stores/speciesStore";
import { clearMapMarkers, displayLocationSamples, setTileLayer } from "@/utils/metadata";
import Toast from "primevue/toast";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { onMounted, onUnmounted, ref, watch, type Ref } from "vue";

const props = defineProps<{
  species: string;
}>();
const { themeState } = useTheme();
const speciesStore = useSpeciesStore();
const map = ref<L.Map | null>(null);
const tileLayer = ref<L.TileLayer | null>(null);
const locationMetadata = await speciesStore.getLocationMetadata(props.species);

onMounted(() => {
  if (!locationMetadata?.length) return;

  map.value = L.map("map", { zoomSnap: 0.1 });

  tileLayer.value = setTileLayer(themeState.value === DARK_THEME, map as Ref<L.Map>);
  displayLocationSamples(map as Ref<L.Map>, locationMetadata);
});

onUnmounted(() => {
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
});

watch(themeState, (newTheme) => {
  if (map.value && tileLayer.value) {
    map.value.removeLayer(tileLayer.value as L.TileLayer);
    tileLayer.value = setTileLayer(newTheme === DARK_THEME, map as Ref<L.Map>);
  }
});

watch(props, async (newProps) => {
  if (map.value) {
    const locationMetadata = await speciesStore.getLocationMetadata(newProps.species);
    clearMapMarkers(map as Ref<L.Map>);
    displayLocationSamples(map as Ref<L.Map>, locationMetadata);
  }
});
</script>

<template>
  <Toast />
  <div class="map-container" v-if="locationMetadata?.length">
    <div id="map" role="application" aria-label="Interactive map displaying location metadata" aria-live="polite"></div>
  </div>
  <div v-else class="mt-2 p-6 text-center surface-border border-top-1">
    <span class="text-red-600">Unable to load location metadata for the selected species.</span>
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
