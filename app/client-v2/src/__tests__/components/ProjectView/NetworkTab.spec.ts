import NetworkTab from "@/components/ProjectView/NetworkTab.vue";
import { networkGraphsUri } from "@/mocks/handlers/projectHandlers";
import { MOCK_CLUSTER_GRAPH_DICT } from "@/mocks/mockObjects";
import { server } from "@/mocks/server";
import { createTestingPinia } from "@pinia/testing";
import { render, screen, waitFor } from "@testing-library/vue";
import { HttpResponse, http } from "msw";
import PrimeVue from "primevue/config";
import { defineComponent } from "vue";

vitest.mock("primevue/usetoast", () => ({
  useToast: vitest.fn()
}));
describe("Network Tabs", () => {
  it("should render network graphs with props for each cluster returned from api", async () => {
    render(NetworkTab, {
      global: {
        plugins: [PrimeVue, createTestingPinia()],
        stubs: {
          NetworkGraph: defineComponent({
            template: "<div>Network Graph {{cluster}}: {{graph}}</div>",
            props: ["cluster", "graph"]
          })
        }
      }
    });

    await waitFor(() => {
      for (const cluster in MOCK_CLUSTER_GRAPH_DICT) {
        expect(screen.getByText(`Network Graph ${cluster}: ${MOCK_CLUSTER_GRAPH_DICT[cluster]}`)).toBeVisible();
      }
    });
  });

  it("should display error message if no network graphs are returned from api", async () => {
    server.use(http.get(`${networkGraphsUri}/:projectHash`, () => HttpResponse.error()));

    render(NetworkTab, {
      global: {
        plugins: [PrimeVue, createTestingPinia()]
      }
    });

    await waitFor(() => {
      expect(screen.getByText(/error fetching/i)).toBeVisible();
    });
  });
});
