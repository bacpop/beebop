import MicroReactColumnVue from "@/components/ProjectView/MicroReactColumn.vue";
import { useProjectStore } from "@/stores/projectStore";
import { AnalysisType } from "@/types/projectTypes";
import { createTestingPinia } from "@pinia/testing";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/vue";
import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";

const mockUseMicroreact = {
  hasMicroReactError: false,
  isMicroReactDialogVisible: false,
  microReactTokenInput: "",
  onMicroReactVisit: vitest.fn(),
  saveMicroreactToken: vitest.fn()
};

vitest.mock("@/composables/useMicroreact", () => ({
  useMicroreact: () => mockUseMicroreact
}));
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
    expect(mockUseMicroreact.onMicroReactVisit).toHaveBeenCalledWith(1);
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

  describe("Save token Dialog", () => {
    it("should display dialog if isMicroReactDialogVisible is true & cluster is present", async () => {
      mockUseMicroreact.isMicroReactDialogVisible = true;
      renderComponent("finished", 1);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeVisible();
      });

      expect(screen.getByRole("button", { name: /Save/ })).toBeDisabled();
      expect(screen.getByRole("button", { name: /Cancel/ })).toBeEnabled();
      expect(screen.getByRole("link")).toHaveAttribute("href", "https://microreact.org/my-account/settings");
      expect(screen.getByPlaceholderText(/enter token/i)).toHaveValue("");
    });

    it("should show error text & red border when hasMicroReactError is true", async () => {
      mockUseMicroreact.hasMicroReactError = true;
      renderComponent("finished", 1);

      await waitFor(() => {
        expect(screen.getByText(/error occurred/i)).toBeVisible();
      });

      expect(screen.getByRole("dialog")).toHaveClass("border-red-500");
    });

    it("should call correct  on save button click", async () => {
      mockUseMicroreact.isMicroReactDialogVisible = true;
      mockUseMicroreact.microReactTokenInput = "token";
      renderComponent("finished", 1);

      const saveButton = await screen.findByRole("button", { name: /Save/ });
      await userEvent.click(saveButton);

      expect(mockUseMicroreact.saveMicroreactToken).toHaveBeenCalledWith(1);
    });
  });
});
