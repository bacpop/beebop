import ProjectPostRun from "@/components/ProjectView/ProjectPostRun.vue";
import { MOCK_PROJECT_SAMPLES } from "@/mocks/mockObjects";
import { useProjectStore } from "@/stores/projectStore";
import { createTestingPinia } from "@pinia/testing";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/vue";
import PrimeVue from "primevue/config";

import Tooltip from "primevue/tooltip";

describe("Post run project", () => {
  it("should render progress bar if progress is not 100%", () => {
    const testingPinia = createTestingPinia();
    const store = useProjectStore(testingPinia);
    // @ts-expect-error: Getter is read only
    store.analysisProgressPercentage = 50;
    render(ProjectPostRun, {
      global: {
        plugins: [PrimeVue, testingPinia],
        stubs: {
          MicroReactColumn: true,
          ProjectDataTable: {
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

    const progressBar = screen.getByRole("progressbar");

    expect(progressBar).toBeVisible();
    expect(progressBar).toHaveAttribute("aria-valuenow", "50");
    expect(screen.getByText(/running analysis/i)).toBeVisible();
  });
  it("should display correct content for tabs when switching", async () => {
    render(ProjectPostRun, {
      global: {
        plugins: [
          PrimeVue,
          createTestingPinia({
            initialState: {
              project: {
                project: {
                  status: {
                    network: "finished"
                  }
                }
              }
            }
          })
        ],
        stubs: {
          MicroReactColumn: true,
          ProjectDataTable: {
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

    const dataTable = screen.getByText(/data table/i);

    expect(screen.queryByText(/network graphs/i)).not.toBeInTheDocument();
    expect(dataTable).toBeVisible();

    await userEvent.click(screen.getByRole("tab", { name: /network/i }));

    expect(screen.getByText(/network graphs/i)).toBeVisible();
    expect(dataTable).not.toBeVisible();
  });
  it("should enable network tab on network finished", async () => {
    render(ProjectPostRun, {
      global: {
        plugins: [PrimeVue, createTestingPinia()],
        stubs: {
          MicroReactColumn: true,
          ProjectDataTable: {
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
    const store = useProjectStore();

    const tabPanel = screen.getByRole("tab", { name: /network/i });

    expect(tabPanel).toHaveAttribute("aria-disabled", "true");

    store.project.status = {
      network: "finished"
    } as any;

    await waitFor(() => {
      expect(tabPanel).toHaveAttribute("aria-disabled", "false");
    });
  });
  it("should render extra columns for data table slot  when project complete", async () => {
    render(ProjectPostRun, {
      global: {
        plugins: [
          PrimeVue,
          createTestingPinia({
            initialState: {
              project: {
                project: {
                  samples: MOCK_PROJECT_SAMPLES,
                  status: {
                    assign: "finished",
                    microreact: "finished",
                    network: "finished"
                  }
                }
              }
            }
          })
        ],
        directives: {
          tooltip: Tooltip
        }
      }
    });

    expect(screen.getAllByRole("button", { name: /download microreact zip/i }).length).toBe(
      MOCK_PROJECT_SAMPLES.length
    );
    expect(screen.getAllByRole("button", { name: /download network zip/i }).length).toBe(MOCK_PROJECT_SAMPLES.length);
    MOCK_PROJECT_SAMPLES.forEach((sample) => {
      expect(screen.getByText(sample.cluster!)).toBeVisible();
    });
  });
  it("should render pending for cluster cells if no cluster assigned ", async () => {
    const copyMockSamples = structuredClone(MOCK_PROJECT_SAMPLES).map((sample) => ({ ...sample, cluster: undefined }));
    render(ProjectPostRun, {
      global: {
        plugins: [
          PrimeVue,
          createTestingPinia({
            initialState: {
              project: {
                project: {
                  samples: copyMockSamples,
                  analysisStatus: undefined
                }
              }
            }
          })
        ],
        directives: {
          tooltip: Tooltip
        }
      }
    });

    expect(screen.getAllByText(/pending/i).length).toBe(copyMockSamples.length);
  });
  it("should render failed network status if network analysis failed", async () => {
    render(ProjectPostRun, {
      global: {
        plugins: [
          PrimeVue,
          createTestingPinia({
            initialState: {
              project: {
                project: {
                  samples: MOCK_PROJECT_SAMPLES,
                  status: {
                    assign: "finished",
                    microreact: "finished",
                    network: "failed"
                  }
                }
              }
            }
          })
        ],
        directives: {
          tooltip: Tooltip
        }
      }
    });

    expect(screen.queryAllByText(/failed/i).length).toBe(MOCK_PROJECT_SAMPLES.length);
  });
  it("should render network status if not failed or finished", async () => {
    render(ProjectPostRun, {
      global: {
        plugins: [
          PrimeVue,
          createTestingPinia({
            initialState: {
              project: {
                project: {
                  samples: MOCK_PROJECT_SAMPLES,
                  status: {
                    assign: "finished",
                    microreact: "finished",
                    network: "started"
                  }
                }
              }
            }
          })
        ],
        directives: {
          tooltip: Tooltip
        }
      }
    });

    expect(screen.queryAllByText(/started/i).length).toBe(MOCK_PROJECT_SAMPLES.length);
  });
});
