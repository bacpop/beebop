import ProjectPreRun from "@/components/ProjectView/ProjectPreRun.vue";
import { MOCK_PROJECT_SAMPLES_BEFORE_RUN } from "@/mocks/mockObjects";
import { createTestingPinia } from "@pinia/testing";
import { render, screen } from "@testing-library/vue";
import PrimeVue from "primevue/config";

vitest.mock("primevue/usetoast", () => ({
  useToast: vitest.fn()
}));
describe("ProjectView ", () => {
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
});
