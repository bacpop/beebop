import CytoscapeCanvas from "@/components/ProjectView/CytoscapeCanvas.vue";
import { MOCK_NETWORK_GRAPH } from "@/mocks/mockObjects";
import { render } from "@testing-library/vue";

vitest.mock("cytoscape", () => ({
  default: vitest.fn(() => ({
    ready: vitest.fn()
  }))
}));
vitest.mock("cytoscape-graphml");
describe("CytoscapeCanvas", () => {
  it("should render div for canvas with correct classes for display", async () => {
    const { container } = render(CytoscapeCanvas, {
      props: {
        graph: MOCK_NETWORK_GRAPH
      }
    });

    expect(container.querySelector(".shadow-5")).toHaveClass(
      "shadow-5 border-round w-full h-full m-auto flex-grow-1 text-left"
    );
  });
});
