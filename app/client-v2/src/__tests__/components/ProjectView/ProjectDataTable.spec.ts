import ProjectDataTableVue from "@/components/ProjectView/ProjectDataTable.vue";
import { MOCK_PROJECT_SAMPLES, MOCK_PROJECT_SAMPLES_BEFORE_RUN } from "@/mocks/mockObjects";
import { createTestingPinia } from "@pinia/testing";
import { render, screen } from "@testing-library/vue";
import PrimeVue from "primevue/config";

vitest.mock("primevue/usetoast", () => ({
  useToast: vitest.fn()
}));
describe("Project data table", () => {
  beforeEach(() => {
    render(ProjectDataTableVue, {
      slots: {
        "table-header": "Header slot",
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
    expect(screen.getByText("Header slot")).toBeVisible();
    expect(screen.getByText("Extra cols slot")).toBeVisible();
  });

  it("should display data with correct sketch tags", async () => {
    expect(screen.getByText("done")).toBeVisible();
    expect(screen.getAllByText("pending").length).toBe(2);
    MOCK_PROJECT_SAMPLES.forEach((sample) => {
      expect(screen.getByText(sample.filename)).toBeVisible();
    });
  });
});
