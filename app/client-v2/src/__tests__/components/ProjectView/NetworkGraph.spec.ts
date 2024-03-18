import NetworkGraph from "@/components/ProjectView/NetworkGraph.vue";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/vue";
import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";

vitest.mock("primevue/usetoast", () => ({
  useToast: vitest.fn()
}));
describe("NetworkGraph", () => {
  it("should render graph and be able to go from fullscreen and close fullscreen mode", async () => {
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

    const clusterTextElements = screen.getAllByText(/test-cluster/i);
    const canvasTextElements = screen.getAllByText(/cytoscape canvas/i);

    expect(clusterTextElements.length).toBe(1);
    expect(canvasTextElements.length).toBe(1);
    expect(canvasTextElements[0]).toHaveAttribute("graph", "test-graph");

    await userEvent.click(screen.getByRole("button", { name: /fullscreen/i }));

    expect(screen.getAllByText(/test-cluster/i).length).toBe(2);
    expect(screen.getAllByText(/cytoscape canvas/i).length).toBe(2);

    await userEvent.click(screen.getByRole("button", { name: /close/i }));

    expect(screen.getAllByText(/test-cluster/i).length).toBe(1);
    expect(screen.getAllByText(/cytoscape canvas/i).length).toBe(1);
  });
});
