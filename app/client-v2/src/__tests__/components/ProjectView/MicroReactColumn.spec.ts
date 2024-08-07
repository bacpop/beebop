import MicroReactColumnVue from "@/components/ProjectView/MicroReactColumn.vue";
import { MOCK_MICROREACT_DICT } from "@/mocks/mockObjects";
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
  onMicroReactVisit: vitest.fn(),
  saveMicroreactToken: vitest.fn(),
  isFetchingMicroreactUrl: false
};
vitest.mock("primevue/usetoast", () => ({
  useToast: vitest.fn()
}));
vitest.mock("@/composables/useMicroreact", () => ({
  useMicroreact: () => mockUseMicroreact
}));
const renderComponent = (status: string, cluster?: string, hasRun = true) =>
  render(MicroReactColumnVue, {
    props: {
      data: {
        cluster,
        hasRun
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
    renderComponent("finished", "GPSC1");
    const store = useProjectStore();

    const downloadButton = screen.getByRole("button", { name: /Download/ });
    const visitButton = screen.getByRole("button", { name: /Visit/ });

    await userEvent.click(downloadButton);
    await userEvent.click(visitButton);

    expect(store.downloadZip).toHaveBeenCalledWith(AnalysisType.MICROREACT, "GPSC1");
    expect(mockUseMicroreact.onMicroReactVisit).toHaveBeenCalledWith("GPSC1");
  });

  it("should disable download and visit buttons if sample not ran and no cluster", async () => {
    renderComponent("finished", undefined, false);

    const downloadButton = screen.getByRole("button", { name: /Download/ });
    const visitButton = screen.getByRole("button", { name: /Visit/ });
    expect(downloadButton).toBeDisabled();
    expect(visitButton).toBeDisabled();
  });

  it("should render failed tag if status is failed", () => {
    renderComponent("failed", "GPSC1");

    expect(screen.getByText(/failed/i)).toBeInTheDocument();
  });
  it("should render status tag if status is not finished or failed", () => {
    renderComponent("started", "GPSC1");

    expect(screen.getByText(/started/i)).toBeInTheDocument();
  });

  it("should show failed tag if no cluster passed in", () => {
    renderComponent("finished");

    expect(screen.getByText(/failed/i)).toBeInTheDocument();
  });

  describe("Save token Dialog", () => {
    it("should display dialog if isMicroReactDialogVisible is true & cluster is present", async () => {
      mockUseMicroreact.isMicroReactDialogVisible = true;
      renderComponent("finished", "GPSC1");

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
      renderComponent("finished", "GPSC1");

      await waitFor(() => {
        expect(screen.getByText(/error occurred/i)).toBeVisible();
      });

      expect(screen.getByRole("dialog")).toHaveClass("border-red-500");
    });

    it("should call saveMicroReactToken and window.open on save button click ", async () => {
      const mockOpen = vitest.fn();
      Object.defineProperty(window, "open", { value: mockOpen });
      mockUseMicroreact.saveMicroreactToken.mockResolvedValue(MOCK_MICROREACT_DICT.url);
      mockUseMicroreact.isMicroReactDialogVisible = true;

      renderComponent("finished", "GPSC1");

      const tokenInput = await screen.findByPlaceholderText(/enter token/i);
      await userEvent.type(tokenInput, "token");
      await userEvent.click(screen.getByRole("button", { name: /Save/ }));

      expect(mockUseMicroreact.saveMicroreactToken).toHaveBeenCalledWith("GPSC1", "token");
      expect(mockOpen).toHaveBeenCalledWith(MOCK_MICROREACT_DICT.url, "_blank");
    });
  });
});
