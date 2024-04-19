import { describe, it, expect, vi } from "vitest";
import DeleteProjectButton from "@/components/HomeView/DeleteProjectButton.vue";
import PrimeVue from "primevue/config";
import { screen, render } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";

vi.mock("primevue/useconfirm", () => ({
  useConfirm: () => ({
    require: vi.fn(),
    close: vi.fn()
  })
}));

vi.mock("@/composables/useToastService", () => ({
  useToastService: () => ({
    showErrorToast: vi.fn(),
    showSuccessToast: vi.fn()
  })
}));

const mockConfirm = {
  require: vi.fn(),
  close: vi.fn()
};
const mockShowErrorToast = vi.fn();
const mockShowSuccessToast = vi.fn();

const renderComponent = () => {
  render(DeleteProjectButton, {
    props: {
      projectId: "1",
      projectName: "Test Project",
      confirm: mockConfirm,
      showErrorToast: mockShowErrorToast,
      showSuccessToast: mockShowSuccessToast
    },
    global: {
      plugins: [PrimeVue]
    }
  });
};

describe("DeleteProjectButton", () => {
  it("renders delete button with correct attributes", () => {
    renderComponent();
    const button = screen.getByRole("button");
    expect(button).toBeVisible();
    expect(button.getAttribute("aria-label")).toBe("delete Test Project");
  });

  it("uses the confirmation service on button click", async () => {
    renderComponent();

    const button = screen.getByRole("button");

    await userEvent.click(button);

    expect(mockConfirm.require).toHaveBeenCalledWith(
      expect.objectContaining({
        message: `Are you sure you want to delete the project 'Test Project'?`,
        header: "Test Project",
        icon: "pi pi-exclamation-triangle",
        rejectLabel: "Cancel",
        acceptLabel: "Delete project",
        rejectClass: "p-button-secondary p-button-outlined",
        acceptClass: "p-button-danger",
        accept: expect.any(Function) // Behavior of 'accept' and 'doDelete' is tested in HomeView.spec.ts
      })
    );
  });
});
