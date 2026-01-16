import MetadataMap from "@/components/MetadataView/MetadataMap.vue";
import { MOCK_LOCATION_METADATA } from "@/mocks/mockObjects";
import { useSpeciesStore } from "@/stores/speciesStore";
import * as metadataUtils from "@/utils/metadata";
import { createTestingPinia } from "@pinia/testing";
import { flushPromises, mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { defineComponent } from "vue";

const mockDisplayLocationSamples = vi.spyOn(metadataUtils, "displayLocationSamples").mockImplementation(() => {});
const mockSetTileLayer = vi.spyOn(metadataUtils, "setTileLayer").mockReturnValue({} as any);
vi.mock("leaflet", () => ({
  default: {
    map: vi.fn().mockReturnValue({})
  }
}));

vitest.mock("primevue/usetoast", () => ({
  useToast: vitest.fn()
}));

const AsyncMetadataMap = defineComponent({
  components: { MetadataMap },
  template: "<Suspense> <MetadataMap species='Test Species' /> </Suspense>"
});
const renderComponent = (testPinia: ReturnType<typeof createTestingPinia>) =>
  mount(AsyncMetadataMap, {
    global: {
      plugins: [PrimeVue, testPinia]
    }
  });

describe("Metadata Map", () => {
  it("should show error message if no location metadata", async () => {
    const testPinia = createTestingPinia();
    const store = useSpeciesStore(testPinia);
    store.getLocationMetadata = vitest.fn().mockResolvedValueOnce([]);
    const wrapper = renderComponent(testPinia);

    await flushPromises();

    expect(store.getLocationMetadata).toHaveBeenCalledWith("Test Species");
    expect(wrapper.text()).toContain("Unable to load location metadata for the selected species.");
  });

  it("should render map if location metadata exists", async () => {
    const testPinia = createTestingPinia();
    const store = useSpeciesStore(testPinia);
    store.getLocationMetadata = vitest.fn().mockResolvedValueOnce(MOCK_LOCATION_METADATA);
    const wrapper = renderComponent(testPinia);

    await flushPromises();

    expect(wrapper.find("#map").exists()).toBe(true);
    expect(mockSetTileLayer).toHaveBeenCalled();
    expect(mockDisplayLocationSamples).toHaveBeenCalled();
  });
});
