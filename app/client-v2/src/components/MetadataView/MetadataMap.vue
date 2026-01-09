<script setup lang="ts">
import { DARK_THEME, useTheme } from "@/composables/useTheme";
import type { LocationMetadata } from "@/stores/speciesStore";
import { getTileLayer } from "@/utils/metadata";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { onMounted, onUnmounted, ref, watch } from "vue";

const { locationMetadata } = defineProps<{
  locationMetadata: LocationMetadata[];
}>();
const { themeState } = useTheme();
const map = ref<L.Map | null>(null);

onMounted(() => {
  map.value = L.map("map", { zoomSnap: 0.1 });

  getTileLayer(themeState.value === DARK_THEME).addTo(map.value as L.Map);

  const baseRadius = 4;
  const scalingFactor = 6;
  const bounds: L.LatLngTuple[] = locationMetadata.map((location) => {
    const radius = baseRadius + Math.log10(location.sampleCount) * scalingFactor;

    L.circleMarker([location.latitude, location.longitude], {
      radius: radius,
      color: "#059669",
      weight: 2,
      fillOpacity: 0.6
    }).addTo(map.value as L.Map).bindTooltip(`
      <div style="font-size: 13px; color: #4b5563; font-family: system-ui, -apple-system, sans-serif;">
      <div><span style="font-weight: 500;">Sample Count:</span>
      <span style="color: #059669; font-weight: 600;">${location.sampleCount}</span></div>
      <div><span style="font-weight: 500;">latitude:</span> ${location.latitude.toFixed(2)}</div>
      <div><span style="font-weight: 500;">longitude:</span> ${location.longitude.toFixed(2)}</div>
      </div>
      `);

    return [location.latitude, location.longitude];
  });

  map.value.fitBounds(bounds);
});

onUnmounted(() => {
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
});

watch(themeState, async (newTheme) => {
  if (map.value) {
    getTileLayer(newTheme === DARK_THEME).addTo(map.value as L.Map);
  }
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
