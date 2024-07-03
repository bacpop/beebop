import ProjectFileUpload from "@/components/ProjectView/ProjectFileUpload.vue";
import { MOCK_PROJECT_SAMPLES_BEFORE_RUN } from "@/mocks/mockObjects";
import { useProjectStore } from "@/stores/projectStore";
import { createTestingPinia } from "@pinia/testing";
import userEvent from "@testing-library/user-event";
import { fireEvent, render, screen, waitFor } from "@testing-library/vue";
import PrimeVue from "primevue/config";

vitest.mock("primevue/usetoast", () => ({
  useToast: vitest.fn()
}));

describe("ProjectFile upload", () => {
  it("should render drag and drop section no files uploaded", () => {
    const testPinia = createTestingPinia();
    const store = useProjectStore(testPinia);
    store.project.samples = [];
    render(ProjectFileUpload, {
      global: {
        plugins: [testPinia, PrimeVue]
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
    render(ProjectFileUpload, {
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
    render(ProjectFileUpload, {
      global: {
        plugins: [testPinia, PrimeVue]
      }
    });

    expect(screen.getByRole("button", { name: /run analysis/i })).toBeDisabled();
  });

  it("should call store.onFilesUpload on files uploaded", async () => {
    const mockFile = { name: "sample1.fasta", text: () => Promise.resolve("sample1") } as File;
    const testPinia = createTestingPinia();
    const store = useProjectStore(testPinia);
    store.project.samples = [];

    const { container } = render(ProjectFileUpload, {
      global: {
        plugins: [testPinia, PrimeVue]
      }
    });

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    await fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(store.onFilesUpload).toHaveBeenCalledWith([mockFile]);
    });
  });

  it("should display running analysis when project is running", () => {
    const testPinia = createTestingPinia();
    const store = useProjectStore(testPinia);
    // @ts-expect-error: Getter is read only
    store.isRunning = true;
    store.project.samples = [];
    // @ts-expect-error: Getter is read only
    store.analysisProgressPercentage = 50;
    render(ProjectFileUpload, {
      global: {
        plugins: [testPinia, PrimeVue]
      }
    });

    const progressBar = screen.getByRole("progressbar");

    expect(progressBar).toBeVisible();
    expect(progressBar).toHaveAttribute("aria-valuenow", "50");
    expect(screen.getByText(/running analysis/i)).toBeVisible();
  });

  it("should highlight drop zone and show drop files button when is dragged over", async () => {
    const testPinia = createTestingPinia();
    const store = useProjectStore(testPinia);
    store.project.samples = MOCK_PROJECT_SAMPLES_BEFORE_RUN;
    render(ProjectFileUpload, {
      global: {
        plugins: [testPinia, PrimeVue]
      },
      slots: {
        default: `<div>Drop Zone</div>`
      }
    });

    const dropZone = screen.getByTestId("drop-zone");

    await fireEvent.dragOver(dropZone);

    expect(dropZone).toHaveClass("opacity-20");
    expect(screen.getByTestId("drop-zone-info")).toBeVisible();
  });

  it("should disable file upload when project is running", async () => {
    const testPinia = createTestingPinia();
    const store = useProjectStore(testPinia);
    store.project.samples = MOCK_PROJECT_SAMPLES_BEFORE_RUN;
    // @ts-expect-error: Getter is read only
    store.isRunning = true;
    const { container } = render(ProjectFileUpload, {
      global: {
        plugins: [testPinia, PrimeVue]
      },
      slots: {
        default: `<div>Drop Zone</div>`
      }
    });

    const dropZone = screen.getByTestId("drop-zone");
    await fireEvent.dragOver(dropZone);

    expect(dropZone).not.toHaveClass("opacity-20");
    expect(container.querySelector('input[type="file"]')).toBeDisabled();
    expect(screen.getByTestId("drop-zone-info")).toHaveClass("hidden");
  });
});
