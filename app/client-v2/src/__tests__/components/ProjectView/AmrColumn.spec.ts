import AmrColumnVue from "@/components/ProjectView/AmrColumn.vue";
import { MOCK_PROJECT_SAMPLES } from "@/mocks/mockObjects";
import type { AMR } from "@/types/projectTypes";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/vue";
import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";

vitest.mock("primevue/usetoast", () => ({
  useToast: vitest.fn()
}));
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

  it("should display correct species abbreviation", async () => {
    renderComponent(MOCK_PROJECT_SAMPLES[0].amr);

    expect(screen.getByText(/P/)).toBeVisible();

    expect(screen.getByText(/C/)).toBeVisible();

    expect(screen.getByText(/E/)).toBeVisible();

    expect(screen.getByText(/Te/)).toBeVisible();

    expect(screen.getByText(/Sxt/)).toBeVisible();
  });

  it("should show tooltip with full name on hover & probability word", async () => {
    const { container } = renderComponent(MOCK_PROJECT_SAMPLES[0].amr);

    const success = container.querySelectorAll(".p-tag")[0];
    await userEvent.hover(success);

    await screen.findByText(/Penicillin: Unlikely/i);
  });
  it("should show tooltip with unkown if probability is amr doesnt not have value", async () => {
    const { container } = renderComponent({
      filename: "sample1.fasta",
      Penicillin: "-",
      Chloramphenicol: "-",
      Erythromycin: "-",
      Tetracycline: "-",
      Trim_sulfa: "-",
      length: "-",
      species: "-"
    } as unknown as AMR);

    const success = container.querySelectorAll(".p-tag")[0];
    await userEvent.hover(success);

    await screen.findByText(/Penicillin: Unknown/i);
  });
});
