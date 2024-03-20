import { useToastService } from "@/composables/useToastService";

const mockToastAdd = vitest.fn();
vitest.mock("primevue/usetoast", () => ({
  useToast: vitest.fn(() => ({
    add: mockToastAdd
  }))
}));
describe("useToastService", () => {
  it("should call add with correct params when showSuccessToast is called", () => {
    const { showSuccessToast } = useToastService();

    showSuccessToast("Success message");

    expect(mockToastAdd).toHaveBeenCalledWith({
      severity: "success",
      summary: "Success",
      detail: "Success message",
      life: 5000
    });
  });

  it("should call add with correct params when showErrorToast is called", () => {
    const { showErrorToast } = useToastService();

    showErrorToast("Error message");

    expect(mockToastAdd).toHaveBeenCalledWith({
      severity: "error",
      summary: "Error",
      detail: "Error message",
      life: 5000
    });
  });

  it("should call add with correct params when showInfoToast is called", () => {
    const { showInfoToast } = useToastService();

    showInfoToast("Info message");

    expect(mockToastAdd).toHaveBeenCalledWith({
      severity: "info",
      summary: "Info",
      detail: "Info message",
      life: 5000
    });
  });
});
