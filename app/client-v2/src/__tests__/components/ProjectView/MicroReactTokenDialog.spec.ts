import MicroReactTokenDialog from "@/components/ProjectView/MicroReactTokenDialog.vue";
import { useUserStore } from "@/stores/userStore";
import { createTestingPinia } from "@pinia/testing";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/vue";
import PrimeVue from "primevue/config";

const renderComponent = ({
  isMicroReactDialogVisible = true,
  hasMicroReactError = false,
  isFetchingMicroreactUrl = false,
  userStoreToken = "1234"
}) =>
  render(MicroReactTokenDialog, {
    props: {
      isMicroReactDialogVisible,
      hasMicroReactError,
      isFetchingMicroreactUrl,
      header: "header title",
      text: "main body"
    },
    global: {
      plugins: [
        PrimeVue,
        createTestingPinia({
          initialState: {
            user: {
              microreactToken: userStoreToken
            }
          }
        })
      ]
    }
  });
describe("MicroReactTokenDialog", () => {
  it("should render initial dialog with correct props", async () => {
    renderComponent({});

    await waitFor(() => {
      expect(screen.getByText("header title")).toBeVisible();
    });
    expect(screen.getByText("main body")).toBeVisible();
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeVisible();
  });

  it("should render error message if hasMicroReactError is true", async () => {
    renderComponent({ hasMicroReactError: true });

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeVisible();
    });
  });

  it("should render loading if isFetchingMicroreactUrl is true", async () => {
    const { container } = render(MicroReactTokenDialog, {
      props: {
        isMicroReactDialogVisible: true,
        hasMicroReactError: false,
        isFetchingMicroreactUrl: true,
        header: "header title",
        text: "main body"
      },
      global: {
        plugins: [
          PrimeVue,
          createTestingPinia({
            initialState: {
              user: {
                microreactToken: "1234"
              }
            }
          })
        ]
      }
    });

    await waitFor(() => {
      expect(container.querySelector("svg.p-icon-spin")).toBeDefined();
    });
  });
  it("should save to be disabled on empty token and then emit saveMicroreact event on click", async () => {
    const { emitted } = renderComponent({ userStoreToken: "" });

    const saveButton = await screen.findByRole("button", { name: /save/i });

    expect(saveButton).toBeDisabled();

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "1234");

    expect(saveButton).not.toBeDisabled();

    await userEvent.click(saveButton);

    expect(emitted("saveMicroreactToken")[0]).toStrictEqual(["1234"]);
  });
  it("should emit close event on close button clicks", async () => {
    const { emitted } = renderComponent({});

    const closeButton = await screen.findByRole("button", { name: /cancel/i });

    await userEvent.click(closeButton);
    await userEvent.click(screen.getByRole("button", { name: /close/i }));

    expect(emitted("closeDialog").length).toBe(2);
  });

  it("should set userStore token to empty string & close dialog on delete button click", async () => {
    const { emitted } = renderComponent({});
    const userStore = useUserStore();
    const deleteButton = await screen.findByRole("button", { name: /delete/i });

    await userEvent.click(deleteButton);

    expect(userStore.microreactToken).toBe("");
    expect(emitted("closeDialog")).toBeDefined();
  });
});
