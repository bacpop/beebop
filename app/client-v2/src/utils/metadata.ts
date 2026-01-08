import L from "leaflet";

export const getTileLayer = (isDarkMode: boolean) =>
  L.tileLayer(
    `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_${isDarkMode ? "Dark" : "Light"}_Gray_Base/MapServer/tile/{z}/{y}/{x}`,
    {
      attribution: "&copy; Powered by Esri &mdash; Esri, DeLorme, NAVTEQ;",
      minZoom: 2,
      maxZoom: 14
    }
  );
