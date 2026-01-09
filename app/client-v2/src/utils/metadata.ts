import type { LocationMetadata } from "@/stores/speciesStore";
import L from "leaflet";
import type { Ref } from "vue";

export const setTileLayer = (isDarkMode: boolean, mapRef: Ref<L.Map>): L.TileLayer => {
  const tileLayer = L.tileLayer(
    `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_${isDarkMode ? "Dark" : "Light"}_Gray_Base/MapServer/tile/{z}/{y}/{x}`,
    {
      attribution: "&copy; Powered by Esri &mdash; Esri, DeLorme, NAVTEQ;",
      minZoom: 2,
      maxZoom: 14
    }
  ).addTo(mapRef.value);

  return tileLayer;
};

export const displayLocationSamples = (mapRef: Ref<L.Map>, locationMetadata: LocationMetadata[]) => {
  const bounds: L.LatLngTuple[] = locationMetadata.map((location) => {
    addCircleMarker(mapRef, location);
    return [location.latitude, location.longitude];
  });

  mapRef.value.fitBounds(bounds);
};

const addCircleMarker = (mapRef: Ref<L.Map>, location: LocationMetadata, baseRadius = 4, scalingFactor = 6) => {
  const radius = baseRadius + Math.log10(location.sampleCount) * scalingFactor;
  const tooltipContent = createTooltipContent(location);

  L.circleMarker([location.latitude, location.longitude], {
    radius,
    color: "#059669",
    weight: 2,
    fillOpacity: 0.6
  })
    .addTo(mapRef.value)
    .bindTooltip(tooltipContent);
};

const createTooltipContent = (location: LocationMetadata): string => {
  return `
    <div style="font-family: system-ui, sans-serif; padding: 4px;">
      <div style="color: #374151; font-weight: 500; margin-bottom: 4px;">
        📍 ${location.country}
      </div>
      <div style="color: #6b7280; font-size: 13px;">
        ${location.sampleCount} samples
      </div>
    </div>
  `;
};
