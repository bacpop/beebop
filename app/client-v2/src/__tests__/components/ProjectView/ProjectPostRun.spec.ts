import ProjectPostRun from "@/components/ProjectView/ProjectPostRun.vue";
import { MOCK_PROJECT_SAMPLES, MOCK_PROJECT_SAMPLES_BEFORE_RUN } from "@/mocks/mockObjects";
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
        MicroReactTokenDialog: {
          template: `<div>MicroReactTokenDialog</div>`
        },
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
        visualiseClusters: {
          GPSC1: "finished"
        }
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

  it("should enable network tab when all visualise finished", async () => {
    const { testPinia, store } = setupPinia({
      samples: MOCK_PROJECT_SAMPLES
    });
    renderComponent(testPinia);

    const tabPanel = screen.getByRole("tab", { name: /network/i });

    expect(tabPanel).toHaveAttribute("aria-disabled", "true");

    store.project.status = {
      visualiseClusters: {
        GPSC1: "finished"
      }
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
        visualise: "finished",
        visualiseClusters: Object.fromEntries(MOCK_PROJECT_SAMPLES.map((sample) => [sample.cluster!, "finished"]))
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

  it("should render failed status chips if visualise analysis failed", async () => {
    const { testPinia } = setupPinia({
      samples: MOCK_PROJECT_SAMPLES,
      status: {
        assign: "finished",
        visualise: "failed"
      }
    });
    renderComponent(testPinia, false);

    expect(screen.queryAllByText(/failed/i).length).toBe(MOCK_PROJECT_SAMPLES.length * 2); // microreact and network
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
        visualise: "finished"
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
        visualise: "started"
      }
    });
    renderComponent(testPinia, false);

    expect(screen.queryAllByText(/started/i).length).toBe(MOCK_PROJECT_SAMPLES.length * 2); // microreact and network
  });

  it("should render disabled microreact setting button when microreact is not finished", async () => {
    const { testPinia } = setupPinia({
      samples: MOCK_PROJECT_SAMPLES,
      status: {
        assign: "finished",
        visualise: "started"
      }
    });
    renderComponent(testPinia, false);

    expect(screen.getByRole("button", { name: /microreact settings/i })).toBeDisabled();
  });

  it("should render disabled microreact setting button when no assigned clusters", async () => {
    const { testPinia } = setupPinia({
      samples: MOCK_PROJECT_SAMPLES_BEFORE_RUN,
      status: {
        assign: "finished",
        visualise: "finished"
      }
    });
    renderComponent(testPinia, false);

    expect(screen.getByRole("button", { name: /microreact settings/i })).toBeDisabled();
  });

  it("should render MicroReactTokenDialog token dialog when firstAssignedCluster is not undefined", async () => {
    const { testPinia } = setupPinia({
      samples: [...MOCK_PROJECT_SAMPLES_BEFORE_RUN, MOCK_PROJECT_SAMPLES[0]]
    });

    renderComponent(testPinia, true);

    expect(screen.getByText(/MicroReactTokenDialog/i)).toBeVisible();
  });

  it("should display failed tags on cluster, network, microreact if status is finished but no cluster", () => {
    const { testPinia } = setupPinia({
      samples: [{ ...MOCK_PROJECT_SAMPLES[0], cluster: undefined }],
      status: {
        assign: "finished",
        visualise: "finished",
        visualiseClusters: { x: "finished" }
      }
    });
    renderComponent(testPinia, false);

    expect(screen.getAllByText("failed").length).toBe(3);
  });

  it("should unmount network tab after running project", async () => {
    const { testPinia } = setupPinia({
      samples: MOCK_PROJECT_SAMPLES,
      status: {
        visualise: "finished",
        visualiseClusters: {
          GPSC1: "finished"
        }
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

  it("should show contact tag when sample failType is warning", async () => {
    const copyMockSample = {
      ...structuredClone(MOCK_PROJECT_SAMPLES[0]),
      failType: "warning",
      failReasons: ["novel genotype detected"]
    };
    const { testPinia } = setupPinia({
      samples: [copyMockSample],
      status: {
        assign: "failed",
        visualise: "failed",
        visualiseClusters: {}
      }
    });

    renderComponent(testPinia, false);

    const link = screen.getByRole("link", { name: /contact support/i });
    expect(link).toHaveAttribute("href", "mailto:gps@pneumogen.net");
    await userEvent.hover(link);
    waitFor(() => {
      expect(screen.getByText(/novel genotype detected/i)).toBeVisible();
    });
    expect(screen.getByText(/unable to assign/i)).toBeVisible();
  });
});
