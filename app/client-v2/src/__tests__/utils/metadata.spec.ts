import { MOCK_LOCATION_METADATA } from "@/mocks/mockObjects";
import { createTooltipContent, displayLocationSamples, setTileLayer } from "@/utils/metadata";
import L from "leaflet";
import { ref, type Ref } from "vue";

vi.mock("leaflet");
describe("Metadata Utils", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  describe("setTileLayer", () => {
    it.each([
      ["light", "Light"],
      ["dark", "Dark"]
    ])("should add the correct tile layer for %s mode", (mode, modeCapitalized) => {
      const mockMap = {} as L.Map;
      const mapRef = ref<L.Map>(mockMap);
      const mockTileLayer = {
        addTo: vi.fn().mockReturnThis()
      };
      vi.mocked(L.tileLayer).mockReturnValue(mockTileLayer as any);

      setTileLayer(mode === "dark", mapRef as Ref<L.Map>);

      expect(L.tileLayer).toHaveBeenCalledWith(
        `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_${modeCapitalized}_Gray_Base/MapServer/tile/{z}/{y}/{x}`,
        {
          attribution: "&copy; Powered by Esri &mdash; Esri, DeLorme, NAVTEQ;",
          minZoom: 2,
          maxZoom: 14
        }
      );
      expect(mockTileLayer.addTo).toHaveBeenCalledWith(mockMap);
    });
  });

  describe("displayLocationSamples", () => {
    it("should create circle markers for each location and fit bounds", () => {
      const mockMap = {
        fitBounds: vi.fn()
      } as any;
      const mapRef = ref<L.Map>(mockMap);
      const mockCircleMarker = {
        addTo: vi.fn().mockReturnThis(),
        bindTooltip: vi.fn().mockReturnThis()
      };
      vi.mocked(L.circleMarker).mockReturnValue(mockCircleMarker as any);

      displayLocationSamples(mapRef as any, MOCK_LOCATION_METADATA);

      expect(L.circleMarker).toHaveBeenCalledTimes(3);
      expect(mockCircleMarker.addTo).toHaveBeenCalledTimes(3);
      expect(mockCircleMarker.bindTooltip).toHaveBeenCalledTimes(3);

      const expectBounds = MOCK_LOCATION_METADATA.map((loc) => [loc.latitude, loc.longitude]);
      expect(mockMap.fitBounds).toHaveBeenCalledWith(expectBounds);
    });

    it("should calculate radius based on sample count with logarithmic scaling", () => {
      const mockMap = {
        fitBounds: vi.fn()
      } as any;
      const mapRef = ref<L.Map>(mockMap);

      const mockCircleMarker = {
        addTo: vi.fn().mockReturnThis(),
        bindTooltip: vi.fn().mockReturnThis()
      };
      vi.mocked(L.circleMarker).mockReturnValue(mockCircleMarker as any);

      const location = { ...MOCK_LOCATION_METADATA[0], sampleCount: 100 };
      const baseRadius = 4;
      const scalingFactor = 6;
      const expectedRadius = baseRadius + Math.log10(100) * scalingFactor;

      displayLocationSamples(mapRef as any, [location]);

      expect(L.circleMarker).toHaveBeenCalledWith([location.latitude, location.longitude], {
        radius: expectedRadius,
        color: "#059669",
        weight: 2,
        fillOpacity: 0.6
      });
    });
    it("should bind tooltip with correct content to each marker", () => {
      const mockMap = {
        fitBounds: vi.fn()
      } as any;
      const mapRef = ref<L.Map>(mockMap);

      const mockCircleMarker = {
        addTo: vi.fn().mockReturnThis(),
        bindTooltip: vi.fn().mockReturnThis()
      };
      vi.mocked(L.circleMarker).mockReturnValue(mockCircleMarker as any);

      const location = MOCK_LOCATION_METADATA[0];
      displayLocationSamples(mapRef as any, [location]);

      expect(mockCircleMarker.bindTooltip).toHaveBeenCalledWith(
        expect.stringContaining(location.sampleCount.toString())
      );
      expect(mockCircleMarker.bindTooltip).toHaveBeenCalledWith(expect.stringContaining(location.latitude.toFixed(2)));
      expect(mockCircleMarker.bindTooltip).toHaveBeenCalledWith(expect.stringContaining(location.longitude.toFixed(2)));
    });
  });
});
