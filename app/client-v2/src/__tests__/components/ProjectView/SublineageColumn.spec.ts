import { render, screen } from "@testing-library/vue";
import SublineageColumnVue from "@/components/ProjectView/SublineageColumn.vue";
import PrimeVue from "primevue/config";
import { MOCK_PROJECT_SAMPLES } from "@/mocks/mockObjects";
import { createTestingPinia } from "@pinia/testing";

vitest.mock("primevue/usetoast", () => ({
  useToast: vitest.fn()
}));
const renderComponent = (
  sublineage = MOCK_PROJECT_SAMPLES[0].sublineage,
  hasRun = true,
  cluster = MOCK_PROJECT_SAMPLES[0].cluster,
  status = { assign: "finished", sublineage_assign: "finished" }
) =>
  render(SublineageColumnVue, {
    props: {
      data: {
        sublineage,
        hasRun,
        cluster
      }
    },
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            project: {
              project: {
                status
              }
            }
          }
        }),
        PrimeVue
      ]
    }
  });

describe("Sublineage column", () => {
  it("should render sublineage info when available", () => {
    renderComponent();

    expect(screen.getByText(/25 • 12 • 5 • 2/i)).toBeVisible();
  });

  it("should render not run if sample has not been run", () => {
    renderComponent(undefined, false);

    expect(screen.getByText(/not run/i)).toBeVisible();
  });

  it("should render failed if sublineage assignment failed", () => {
    renderComponent(undefined, true, undefined, { assign: "finished", sublineage_assign: "failed" });

    expect(screen.getByText(/failed/i)).toBeVisible();
  });

  it("should render failed if cluster assignment finished and no cluster assigned", () => {
    renderComponent(undefined, true, null as any, { assign: "finished", sublineage_assign: "waiting" });

    expect(screen.getByText(/failed/i)).toBeVisible();
  });

  it("should render unavailable if sublineage is unavailable", () => {
    renderComponent(null as any, true, undefined, { assign: "finished", sublineage_assign: "finished" });

    expect(screen.getByText(/unavailable/i)).toBeVisible();
  });

  it("should render status if not caught by other conditions", () => {
    renderComponent(null as any, true, undefined, { assign: "finished", sublineage_assign: "pending" });

    expect(screen.getByText(/pending/i)).toBeVisible();
  });
});
