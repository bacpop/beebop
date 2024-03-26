import NetworkGraph from "@/components/ProjectView/NetworkGraph.vue";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/vue";
import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";

vitest.mock("primevue/usetoast", () => ({
  useToast: vitest.fn()
}));
describe("NetworkGraph", () => {
  it("should render info and graphs with correct props", async () => {
    render(NetworkGraph, {
      props: {
        graph: "test-graph",
        cluster: "test-cluster"
      },
      global: {
        plugins: [PrimeVue],
        stubs: {
          CytoscapeCanvas: {
            template: "<div>cytoscape canvas</div>"
          }
        },
        directives: {
          tooltip: Tooltip
        }
      }
    });

    const graph = screen.getByText("cytoscape canvas");

    expect(graph).toHaveAttribute("graph", "test-graph");
    expect(graph).toHaveAttribute("cluster", "test-cluster");
  });
});
