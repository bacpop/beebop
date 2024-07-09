import ProjectDataTableVue from "@/components/ProjectView/ProjectDataTable.vue";
import { MOCK_PROJECT_SAMPLES, MOCK_PROJECT_SAMPLES_BEFORE_RUN } from "@/mocks/mockObjects";
import { useProjectStore } from "@/stores/projectStore";
import { createTestingPinia } from "@pinia/testing";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/vue";
import PrimeVue from "primevue/config";

vitest.mock("primevue/usetoast", () => ({
  useToast: vitest.fn()
}));
describe("Project data table", () => {
  beforeEach(() => {
    render(ProjectDataTableVue, {
      slots: {
        "extra-cols": "Extra cols slot"
      },
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
          AmrColumn: true
        }
      }
    });
  });
  it("should display slots correctly", () => {
    expect(screen.getByText("Extra cols slot")).toBeVisible();
  });

  it("should display data with correct sketch tags", async () => {
    expect(screen.getByText("done")).toBeVisible();
    expect(screen.getAllByText("pending").length).toBe(2);
    MOCK_PROJECT_SAMPLES.forEach((sample) => {
      expect(screen.getByText(sample.filename)).toBeVisible();
    });
  });

  it("should render enabled button to remove uploaded files and call store.removeUploadedFile on click when ready to run", async () => {
    const store = useProjectStore();
    // @ts-expect-error: Getter is read only
    store.isReadyToRun = true;

    const removeButton = screen.getAllByRole("button", { name: /remove/i })[1];

    await userEvent.click(removeButton);

    await waitFor(() => {
      expect(store.removeUploadedFile).toHaveBeenCalledWith(1);
    });
  });

  it("should render disabled button to remove uploaded files when not ready to run", async () => {
    const store = useProjectStore();
    // @ts-expect-error: Getter is read only
    store.isReadyToRun = false;

    const removeButton = screen.getAllByRole("button", { name: /remove/i })[1];

    expect(removeButton).toBeDisabled();
  });

  it("should render disabled button to remove uploaded files when project is running", async () => {
    const store = useProjectStore();
    // @ts-expect-error: Getter is read only
    store.isRunning = true;

    const removeButton = screen.getAllByRole("button", { name: /remove/i })[1];

    expect(removeButton).toBeDisabled();
  });
});
