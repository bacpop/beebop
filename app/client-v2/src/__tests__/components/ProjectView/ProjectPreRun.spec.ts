import ProjectPreRun from "@/components/ProjectView/ProjectPreRun.vue";
import { MOCK_PROJECT_SAMPLES_BEFORE_RUN } from "@/mocks/mockObjects";
import { useProjectStore } from "@/stores/projectStore";
import { createTestingPinia } from "@pinia/testing";
import userEvent from "@testing-library/user-event";
import { fireEvent, render, screen, waitFor } from "@testing-library/vue";
import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";

vitest.mock("primevue/usetoast", () => ({
  useToast: vitest.fn()
}));
describe("ProjectView ", () => {
  it("should render drag and drop section no files uploaded", () => {
    render(ProjectPreRun, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              project: {
                project: {
                  samples: []
                }
              }
            }
          }),
          PrimeVue
        ]
      }
    });

    expect(screen.getByText(/drag and drop/i)).toBeVisible();
  });
  it("should call store.RunAnalysis on run analysis click and not disabled", async () => {
    const testPinia = createTestingPinia();
    const store = useProjectStore(testPinia);
    // @ts-expect-error: Getter is read only
    store.isReadyToRun = true;
    store.project.samples = [];
    render(ProjectPreRun, {
      global: {
        plugins: [testPinia, PrimeVue]
      }
    });

    await userEvent.click(screen.getByRole("button", { name: /run analysis/i }));

    expect(store.runAnalysis).toHaveBeenCalled();
  });
  it("should disable run analysis button when isReadyToRun is false", () => {
    const testPinia = createTestingPinia();
    const store = useProjectStore(testPinia);
    store.project.samples = [];
    // @ts-expect-error: Getter is read only
    store.isReadyToRun = false;
    render(ProjectPreRun, {
      global: {
        plugins: [testPinia, PrimeVue]
      }
    });

    expect(screen.getByRole("button", { name: /run analysis/i })).toBeDisabled();
  });
  it("should render data table if file samples uploaded", () => {
    render(ProjectPreRun, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              project: {
                project: {
                  samples: MOCK_PROJECT_SAMPLES_BEFORE_RUN
                }
              }
            }
          }),
          PrimeVue
        ],
        stubs: {
          ProjectDataTable: {
            template: `<div>Data Table</div>`
          }
        }
      }
    });

    expect(screen.getByText(/data table/i)).toBeVisible();
  });

  it("should call store.onFilesUpload on files uploaded", async () => {
    const mockFile = { name: "sample1.fasta", text: () => Promise.resolve("sample1") } as File;
    const { container } = render(ProjectPreRun, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              project: {
                project: {
                  samples: []
                }
              }
            }
          }),
          PrimeVue
        ]
      }
    });
    const store = useProjectStore();

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    await fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(store.onFilesUpload).toHaveBeenCalledWith([mockFile]);
    });
  });

  it("should render enabled button to remove uploaded files and call store.removeUploadedFile on click when ready to run", async () => {
    const testingPinia = createTestingPinia();
    const store = useProjectStore();
    // @ts-expect-error: Getter is read only
    store.isReadyToRun = true;
    store.project.samples = MOCK_PROJECT_SAMPLES_BEFORE_RUN;

    render(ProjectPreRun, {
      global: {
        plugins: [PrimeVue, testingPinia],
        directives: {
          tooltip: Tooltip
        }
      }
    });
    const removeButton = screen.getAllByRole("button", { name: /remove/i })[1];

    await userEvent.click(removeButton);

    await waitFor(() => {
      expect(store.removeUploadedFile).toHaveBeenCalledWith(1);
    });
  });
});
