import userEvent from "@testing-library/user-event";
import { createTestingPinia } from "@pinia/testing";
import PrimeVue from "primevue/config";
import Ripple from "primevue/ripple";
import { render, screen, within } from "@testing-library/vue";
import { defineComponent } from "vue";
import { createWebHistory } from "vue-router";
import { createRouter } from "vue-router";
import AppNavVue from "@/layouts/AppNav.vue";

const mockedThemeValues = {
  setInitialTheme: vitest.fn(),
  themeIcon: "some-icon",
  toggleTheme: vitest.fn()
};
vitest.mock("@/composables/useTheme", () => ({
  useTheme: () => mockedThemeValues
}));
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: defineComponent({ template: `<div>Home</div>` }) },
    { path: "/about", component: defineComponent({ template: `<div>About page</div>` }) },
    { path: "/login", component: defineComponent({ template: `<div>Login</div>` }) }
  ]
});
const renderApp = async (userState = {}) => {
  router.push("/about");
  await router.isReady();

  return render(AppNavVue, {
    global: {
      plugins: [
        router,
        createTestingPinia({
          initialState: { user: userState }
        }),
        PrimeVue
      ],
      directives: { ripple: Ripple }
    }
  });
};
describe("App Nav", () => {
  it("should render nav bar with links to home and about and no user-menu", async () => {
    await renderApp();

    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("menuitem", { name: /about/i })).toBeVisible();
    expect(screen.queryByRole("button", { name: "user-menu" })).not.toBeInTheDocument();
  });
  it("should toggle theme when theme icon is clicked", async () => {
    await renderApp();

    const themeIcon = screen.getByRole("button", { name: /switch theme/i });
    await userEvent.click(themeIcon);

    expect(mockedThemeValues.toggleTheme).toHaveBeenCalled();
  });
  it("should show user menu and and be able to logout when authenticated", async () => {
    await renderApp({ id: "1", name: "LeBron" });

    await userEvent.click(screen.getByRole("button", { name: "user-menu" }));

    expect(screen.getByText("LeBron")).toBeInTheDocument();

    const logoutButton = screen.getByRole("menuitem", { name: /logout/i });

    expect(within(logoutButton).getByRole("link", { hidden: true })).toHaveAttribute(
      "href",
      expect.stringContaining("/logout")
    );
  });
});
