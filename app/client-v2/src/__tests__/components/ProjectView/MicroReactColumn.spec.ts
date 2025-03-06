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
const renderComponent = (
  microreactStatus: string | null = "finished",
  visualiseClusterstatuses: Record<string, unknown> = { GPSC1: "finished" },
  cluster: string | null = "GPSC1",
  hasRun = true
) =>
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
                status: { microreact: microreactStatus, visualiseClusters: visualiseClusterstatuses }
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
    renderComponent();
    const store = useProjectStore();

    const downloadButton = screen.getByRole("button", { name: /Download/ });
    const visitButton = screen.getByRole("button", { name: /Visit/ });

    await userEvent.click(downloadButton);
    await userEvent.click(visitButton);

    expect(store.downloadZip).toHaveBeenCalledWith(AnalysisType.MICROREACT, "GPSC1");
    expect(mockUseMicroreact.onMicroReactVisit).toHaveBeenCalledWith("GPSC1");
  });

  it("should disable download and visit buttons if sample not ran and no cluster", async () => {
    renderComponent(undefined, undefined, null, false);

    const downloadButton = screen.getByRole("button", { name: /Download/ });
    const visitButton = screen.getByRole("button", { name: /Visit/ });
    expect(downloadButton).toBeDisabled();
    expect(visitButton).toBeDisabled();
  });

  it("should render failed tag if status is failed", () => {
    renderComponent(undefined, { GPSC1: "failed" });

    expect(screen.getByText(/failed/i)).toBeInTheDocument();
  });

  it("should render status tag if status is not finished or failed", () => {
    renderComponent("deferred", { GPSC1: "started" });

    expect(screen.getByText(/started/i)).toBeInTheDocument();
  });

  it("should show waiting tag if no cluster status or microreact status", () => {
    renderComponent(null, {});

    expect(screen.getByText(/waiting/i)).toBeInTheDocument();
  });

  describe("Save token Dialog", () => {
    it("should display dialog if isMicroReactDialogVisible is true & cluster is present", async () => {
      mockUseMicroreact.isMicroReactDialogVisible = true;
      renderComponent();

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
      renderComponent();

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

      renderComponent();

      const tokenInput = await screen.findByPlaceholderText(/enter token/i);
      await userEvent.type(tokenInput, "token");
      await userEvent.click(screen.getByRole("button", { name: /Save/ }));

      expect(mockUseMicroreact.saveMicroreactToken).toHaveBeenCalledWith("GPSC1", "token");
      expect(mockOpen).toHaveBeenCalledWith(MOCK_MICROREACT_DICT.url, "_blank");
    });
  });
});
