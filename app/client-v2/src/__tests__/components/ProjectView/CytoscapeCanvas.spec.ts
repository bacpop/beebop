import CytoscapeCanvas from "@/components/ProjectView/CytoscapeCanvas.vue";
import { MOCK_NETWORK_GRAPH } from "@/mocks/mockObjects";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/vue";
import Tooltip from "primevue/tooltip";

vitest.mock("cytoscape", () => ({
  default: vitest.fn(() => ({
    ready: vitest.fn()
  }))
}));
vitest.mock("cytoscape-graphml");
describe("CytoscapeCanvas", () => {
  it("should render div & buttons only for canvas with correct classes for display", async () => {
    const { container, emitted } = render(CytoscapeCanvas, {
      props: {
        graph: MOCK_NETWORK_GRAPH,
        cluster: "test-cluster"
      },
      global: {
        directives: {
          Tooltip
        }
      }
    });

    await userEvent.click(screen.getByRole("button", { name: /fullscreen/i }));
    console.log(emitted());

    expect(screen.getByRole("button", { name: /reset/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /fullscreen/i })).toBeVisible();
    expect(container.querySelector(".shadow-5")).toHaveClass(
      "shadow-5 border-round w-full h-full m-auto flex-grow-1 text-left"
    );
  });

  it("should call onFullScreen emit when fullscreen button is clicked", async () => {
    const { emitted } = render(CytoscapeCanvas, {
      props: {
        graph: MOCK_NETWORK_GRAPH,
        cluster: "test-cluster"
      },
      global: {
        directives: {
          Tooltip
        }
      }
    });

    await userEvent.click(screen.getByRole("button", { name: /fullscreen/i }));

    expect(emitted()).toHaveProperty("onFullScreen");
  });

  it("should not render fullscreen button when isFullscreen prop is true", async () => {
    render(CytoscapeCanvas, {
      props: {
        graph: MOCK_NETWORK_GRAPH,
        cluster: "test-cluster",
        isFullScreen: true
      },
      global: {
        directives: {
          Tooltip
        }
      }
    });
    expect(screen.queryByRole("button", { name: /fullscreen/i })).not.toBeInTheDocument();
  });
});
