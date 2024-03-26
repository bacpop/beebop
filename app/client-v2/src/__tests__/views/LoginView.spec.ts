import LoginViewVue from "@/views/LoginView.vue";
import { render, screen } from "@testing-library/vue";
import { createTestingPinia } from "@pinia/testing";
import { useRouter } from "vue-router";
import type { Mock } from "vitest";
import userEvent from "@testing-library/user-event";

vitest.mock("vue-router", () => ({
  useRoute: vitest.fn(),
  useRouter: vitest.fn(() => ({
    push: () => {}
  }))
}));

describe("Login view", () => {
  it("should render login form with correct links for github & google", () => {
    render(LoginViewVue, {
      global: {
        plugins: [createTestingPinia()]
      }
    });

    expect(screen.getByText(/sign in to continue/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute(
      "href",
      expect.stringContaining("/login/github")
    );
    expect(screen.getByRole("link", { name: /google/i })).toHaveAttribute(
      "href",
      expect.stringContaining("/login/google")
    );
  });

  it("should disable button & show loader on button clicks", async () => {
    const { container } = render(LoginViewVue, {
      global: {
        plugins: [createTestingPinia()]
      }
    });

    const gitHubButton = screen.getByRole("button", { name: /github/i });
    const googleButton = screen.getByRole("button", { name: /google/i });

    expect(gitHubButton).not.toHaveAttribute("disabled");
    expect(googleButton).not.toHaveAttribute("disabled");

    await userEvent.click(gitHubButton);
    await userEvent.click(googleButton);

    expect(gitHubButton).toHaveAttribute("disabled");
    expect(googleButton).toHaveAttribute("disabled");
    expect(container.querySelectorAll("svg.p-icon-spin").length).toBe(2);
  });

  it("should route to '/' when user is authenticated", async () => {
    const push = vitest.fn();
    (useRouter as Mock).mockImplementationOnce(() => ({
      push
    }));

    render(LoginViewVue, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: { user: { id: true } }
          })
        ],
        stubs: ["router-link", "router-view"]
      }
    });

    expect(push).toHaveBeenCalledWith("/");
  });
});
