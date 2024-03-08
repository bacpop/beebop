import MicroReactColumnVue from "@/components/ProjectView/MicroReactColumn.vue";
import { useProjectStore } from "@/stores/projectStore";
import { AnalysisType } from "@/types/projectTypes";
import { createTestingPinia } from "@pinia/testing";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/vue";
import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";

const renderComponent = (status: string, cluster?: number) =>
  render(MicroReactColumnVue, {
    props: {
      data: {
        cluster
      }
    },
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            project: {
              project: {
                status: { microreact: status }
              }
            }
          }
        }),
        PrimeVue
      ],
      directives: {
        tooltip: Tooltip
      }
    }
  });
describe("MicroReactColumn", () => {
  it("should call correct actions on download and visit buttons if status finished and cluster assigned", async () => {
    renderComponent("finished", 1);
    const store = useProjectStore();

    const downloadButton = screen.getByRole("button", { name: /Download/ });
    const visitButton = screen.getByRole("button", { name: /Visit/ });

    await userEvent.click(downloadButton);
    await userEvent.click(visitButton);

    expect(store.downloadZip).toHaveBeenCalledWith(AnalysisType.MICROREACT, 1);
    expect(store.onMicroReactVisit).toHaveBeenCalledWith(1);
  });
  it("should render failed tag if status is failed", () => {
    renderComponent("failed", 1);

    expect(screen.getByText(/failed/i)).toBeInTheDocument();
  });
  it("should render status tag if status is not finished or failed", () => {
    renderComponent("started", 1);

    expect(screen.getByText(/started/i)).toBeInTheDocument();
  });

  it("should disable buttons if no cluster passed in", () => {
    renderComponent("finished");

    expect(screen.getByRole("button", { name: /Download/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Visit/ })).toBeDisabled();
  });
});
