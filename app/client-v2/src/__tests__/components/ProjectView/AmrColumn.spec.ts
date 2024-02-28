import AmrColumnVue from "@/components/ProjectView/AmrColumn.vue";
import { MOCK_PROJECT_SAMPLES } from "@/mocks/mockObjects";
import type { AMR } from "@/types/projectTypes";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/vue";
import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";

const renderComponent = (amr?: AMR) => {
  return render(AmrColumnVue, {
    props: {
      amr
    },
    global: {
      plugins: [PrimeVue],
      directives: {
        tooltip: Tooltip
      }
    }
  });
};
describe("AMR column", () => {
  it("should display pending if no amr data passed in", () => {
    renderComponent();

    expect(screen.getByText(/pending/)).toBeVisible();
  });
  it("should display correct tag severity for items", () => {
    const { container } = renderComponent(MOCK_PROJECT_SAMPLES[0].amr);

    const success = container.querySelectorAll(".p-tag-success");
    const warning = container.querySelectorAll(".p-tag-warning");
    const danger = container.querySelectorAll(".p-tag-danger");

    expect(success.length).toBe(1);
    expect(warning.length).toBe(2);
    expect(danger.length).toBe(2);
  });
  it("should display correct % and species abbreviation", async () => {
    renderComponent(MOCK_PROJECT_SAMPLES[0].amr);

    expect(screen.getByText(/P/)).toBeVisible();
    expect(screen.getByText(/24/)).toBeVisible();

    expect(screen.getByText(/C/)).toBeVisible();
    expect(screen.getByText(/99/)).toBeVisible();

    expect(screen.getByText(/E/)).toBeVisible();
    expect(screen.getByText(/44/)).toBeVisible();

    expect(screen.getByText(/Te/)).toBeVisible();
    expect(screen.getByText(/8/)).toBeVisible();

    expect(screen.getByText(/Sxt/)).toBeVisible();
    expect(screen.getByText(/33/)).toBeVisible();
  });
  it("should show tooltip with full name on hover", async () => {
    const { container } = renderComponent(MOCK_PROJECT_SAMPLES[0].amr);

    const success = container.querySelectorAll(".p-tag-success")[0];
    await userEvent.hover(success);

    await screen.findByText(/Chloramphenicol/);
  });
});
