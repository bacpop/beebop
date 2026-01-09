import type { LocationMetadata } from "@/stores/speciesStore";
import L from "leaflet";
import type { Ref } from "vue";

export const setTileLayer = (isDarkMode: boolean, mapRef: Ref<L.Map | null>) => {
  if (!mapRef.value) return;

  L.tileLayer(
    `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_${isDarkMode ? "Dark" : "Light"}_Gray_Base/MapServer/tile/{z}/{y}/{x}`,
    {
      attribution: "&copy; Powered by Esri &mdash; Esri, DeLorme, NAVTEQ;",
      minZoom: 2,
      maxZoom: 14
    }
  ).addTo(mapRef.value);
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
    <div style="font-size: 13px; color: #4b5563; font-family: system-ui, -apple-system, sans-serif;">
      <div>
        <span style="font-weight: 500;">Sample Count:</span>
        <span style="color: #059669; font-weight: 600;">${location.sampleCount}</span>
      </div>
      <div><span style="font-weight: 500;">Latitude:</span> ${location.latitude.toFixed(2)}</div>
      <div><span style="font-weight: 500;">Longitude:</span> ${location.longitude.toFixed(2)}</div>
    </div>
  `;
};
