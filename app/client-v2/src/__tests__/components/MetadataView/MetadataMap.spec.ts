import PrimeVue from "primevue/config";
import MetadataMap from "@/components/MetadataView/MetadataMap.vue";
import { render, screen } from "@testing-library/vue";
import { MOCK_LOCATION_METADATA } from "@/mocks/mockObjects";
import * as metadataUtils from "@/utils/metadata";

const mockDisplayLocationSamples = vi.spyOn(metadataUtils, "displayLocationSamples").mockImplementation(() => {});
const mockSetTileLayer = vi.spyOn(metadataUtils, "setTileLayer").mockImplementation(() => {});

const renderComponent = () =>
  render(MetadataMap, {
    global: {
      plugins: [PrimeVue]
    },
    props: {
      locationMetadata: MOCK_LOCATION_METADATA
    }
  });
describe("Metadata Map", () => {
  it("should render map", () => {
    const { container } = renderComponent();

    expect(container.querySelector("#map")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Leaflet/ })).toBeVisible();
    expect(mockSetTileLayer).toHaveBeenCalled();
    expect(mockDisplayLocationSamples).toHaveBeenCalled();
  });
});
