<script setup lang="ts">
import locationMetadata from "@/assets/pneumo_location_metadata.json";
import { onMounted, onUnmounted, ref } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// TODO: move map component to its own file so it can read different sample metadata files
const map = ref<L.Map | null>(null);
onMounted(() => {
  map.value = L.map("map", { zoomSnap: 0.1 });

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    minZoom: 2,
    maxZoom: 14
  }).addTo(map.value);

  const bounds: [number, number][] = [];
  locationMetadata.forEach((location) => {
    L.circleMarker([location.Latitude, location.Longitude], {
      radius: 6,
      color: "#059669",
      weight: 2,
      fillOpacity: 0.6
    }).addTo(map.value!).bindTooltip(`
      <div style="font-size: 13px; color: #4b5563; font-family: system-ui, -apple-system, sans-serif;">
      <div><span style="font-weight: 500;">Sample Count:</span>
      <span style="color: #059669; font-weight: 600;">${location.Sample_count}</span></div>
      <div><span style="font-weight: 500;">Latitude:</span> ${location.Latitude.toFixed(2)}</div>
      <div><span style="font-weight: 500;">Longitude:</span> ${location.Longitude.toFixed(2)}</div>
      </div>
      `);
    bounds.push([location.Latitude, location.Longitude]);
  });
  map.value.fitBounds(bounds);
});

onUnmounted(() => {
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
});
</script>

<template>
  <div class="flex flex-column">
    <div>
      <h2 class="text-2xl font-bold mb-2">Geographical Distribution of Samples</h2>
      <p class="text-base text-color-secondary">
        This map visualizes the geographical distribution of samples based on the provided metadata. Each marker
        represents a location where samples were collected, with a popup displaying the sample count for that location.
      </p>
    </div>
    <div class="map-container">
      <div id="map"></div>
    </div>
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
