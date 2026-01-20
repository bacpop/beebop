import { MOCK_SPECIES, MOCK_SPECIES_CONFIG } from "@/mocks/mockObjects";
import MetadataView from "@/views/MetadataView.vue";
import { createTestingPinia } from "@pinia/testing";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/vue";
import PrimeVue from "primevue/config";
import { defineComponent } from "vue";

vitest.mock("primevue/usetoast", () => ({
  useToast: vitest.fn()
}));
const renderComponent = () =>
  render(MetadataView, {
    global: {
      plugins: [
        PrimeVue,
        createTestingPinia({
          initialState: {
            species: {
              species: MOCK_SPECIES,
              speciesConfig: MOCK_SPECIES_CONFIG
            }
          }
        })
      ],
      stubs: {
        MetadataMap: defineComponent({
          template: `<div id="map">Metadata Map</div>`
        })
      }
    }
  });

describe("MetadataView component", () => {
  it("should select species text if no species selected", () => {
    renderComponent();

    expect(screen.getByText(/Please select a species to view location metadata/i)).toBeVisible();
  });

  it("should render map if species is selected", async () => {
    const { container } = renderComponent();

    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByRole("option", { name: MOCK_SPECIES[0] }));

    await waitFor(() => {
      expect(container.querySelector("#map")).toBeInTheDocument();
      expect(screen.getByText(/Metadata Map/i)).toBeVisible();
    });
  });
});
