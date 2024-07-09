import ProjectPostRun from "@/components/ProjectView/ProjectPostRun.vue";
import { MOCK_PROJECT_SAMPLES } from "@/mocks/mockObjects";
import { useProjectStore } from "@/stores/projectStore";
import { createTestingPinia, type TestingPinia } from "@pinia/testing";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/vue";
import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";

vitest.mock("primevue/usetoast", () => ({
  useToast: vitest.fn()
}));

const renderComponent = (testPinia: TestingPinia, shouldStubTable = true) =>
  render(ProjectPostRun, {
    global: {
      plugins: [PrimeVue, testPinia],
      stubs: {
        MicroReactTokenDialog: true,
        ProjectDataTable: shouldStubTable && {
          template: `<div>Data Table</div>`
        },
        NetworkTab: {
          template: `<div>Network Graphs</div>`
        }
      },
      directives: {
        tooltip: Tooltip
      }
    }
  });
const setupPinia = (storeState: Record<string, unknown>) => {
  const testPinia = createTestingPinia();
  const store = useProjectStore();
  store.project = storeState as any;

  return { testPinia, store };
};
describe("RunProject", () => {
  it("should display correct content for tabs when switching", async () => {
    const { testPinia } = setupPinia({
      samples: MOCK_PROJECT_SAMPLES,
      status: {
        network: "finished"
      }
    });
    renderComponent(testPinia);

    const dataTable = screen.getByText(/data table/i);

    expect(screen.queryByText(/network graphs/i)).not.toBeInTheDocument();
    expect(dataTable).toBeVisible();

    await userEvent.click(screen.getByRole("tab", { name: /network/i }));

    expect(screen.getByText(/network graphs/i)).toBeVisible();
    expect(dataTable).not.toBeVisible();
  });

  it("should enable network tab on network finished", async () => {
    const { testPinia, store } = setupPinia({
      samples: MOCK_PROJECT_SAMPLES
    });
    renderComponent(testPinia);

    const tabPanel = screen.getByRole("tab", { name: /network/i });

    expect(tabPanel).toHaveAttribute("aria-disabled", "true");

    store.project.status = {
      network: "finished"
    } as any;

    await waitFor(() => {
      expect(tabPanel).toHaveAttribute("aria-disabled", "false");
    });
  });

  it("should render extra columns for data table slot when project has run", async () => {
    const { testPinia } = setupPinia({
      samples: MOCK_PROJECT_SAMPLES,
      status: {
        assign: "finished",
        microreact: "finished",
        network: "finished"
      }
    });
    renderComponent(testPinia, false);

    expect(screen.getAllByRole("button", { name: /download network zip/i }).length).toBe(MOCK_PROJECT_SAMPLES.length);
    MOCK_PROJECT_SAMPLES.forEach((sample) => {
      expect(screen.getByText(sample.cluster!)).toBeVisible();
    });
  });

  it("should render pending for cluster cells if no cluster assigned and sample hasRun", async () => {
    const copyMockSamples = structuredClone(MOCK_PROJECT_SAMPLES).map((sample) => ({
      ...sample,
      hasRun: true
    }));
    const { testPinia } = setupPinia({
      samples: copyMockSamples,
      status: undefined
    });
    renderComponent(testPinia, false);

    expect(screen.getAllByText(/pending/i).length).toBe(copyMockSamples.length);
  });

  it("should render not run for cluster cells if no cluster assigned and sample has not run", async () => {
    const copyMockSamples = structuredClone(MOCK_PROJECT_SAMPLES).map((sample) => ({
      ...sample,
      cluster: undefined,
      hasRun: false
    }));
    const { testPinia } = setupPinia({
      samples: copyMockSamples,
      status: undefined
    });
    renderComponent(testPinia, false);

    expect(screen.getAllByText(/not run/i).length).toBe(copyMockSamples.length);
  });

  it("should render failed network status if network analysis failed", async () => {
    const { testPinia } = setupPinia({
      samples: MOCK_PROJECT_SAMPLES,
      status: {
        assign: "finished",
        microreact: "finished",
        network: "failed"
      }
    });
    renderComponent(testPinia, false);

    expect(screen.queryAllByText(/failed/i).length).toBe(MOCK_PROJECT_SAMPLES.length);
  });

  it("should render disabled network download if finished and sample not run", async () => {
    const copyMockSamples = structuredClone(MOCK_PROJECT_SAMPLES).map((sample) => ({
      ...sample,
      cluster: undefined,
      hasRun: false
    }));
    const { testPinia } = setupPinia({
      samples: copyMockSamples,
      status: {
        assign: "finished",
        microreact: "finished",
        network: "finished"
      }
    });
    renderComponent(testPinia, false);

    screen.getAllByRole("button", { name: /download network zip/i }).forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("should render network status if not failed or finished", async () => {
    const { testPinia } = setupPinia({
      samples: MOCK_PROJECT_SAMPLES,
      status: {
        assign: "finished",
        microreact: "finished",
        network: "started"
      }
    });
    renderComponent(testPinia, false);

    expect(screen.queryAllByText(/started/i).length).toBe(MOCK_PROJECT_SAMPLES.length);
  });

  it("should render disabled microreact setting button when microreact is not finished", async () => {
    const { testPinia } = setupPinia({
      samples: MOCK_PROJECT_SAMPLES,
      status: {
        assign: "finished",
        microreact: "started",
        network: "finished"
      }
    });
    renderComponent(testPinia, false);

    expect(screen.getByRole("button", { name: /microreact settings/i })).toBeDisabled();
  });

  it("should display failed tags on cluster, network, microreact if status is finished but no cluster", () => {
    const { testPinia } = setupPinia({
      samples: [{ ...MOCK_PROJECT_SAMPLES[0], cluster: undefined }],
      status: {
        assign: "finished",
        microreact: "finished",
        network: "finished"
      }
    });
    renderComponent(testPinia, false);

    expect(screen.getAllByText("failed").length).toBe(3);
  });

  it("should unmount network tab after running project", async () => {
    const { testPinia } = setupPinia({
      samples: MOCK_PROJECT_SAMPLES,
      status: {
        network: "finished"
      }
    });
    renderComponent(testPinia);

    expect(screen.queryByText(/network graphs/i)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: /network/i }));
    await userEvent.click(screen.getByRole("tab", { name: /samples/i }));
    expect(screen.getByText(/network graphs/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /run analysis/i }));

    expect(screen.queryByText(/network graphs/i)).not.toBeInTheDocument();
  });
});
