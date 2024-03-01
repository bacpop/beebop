import AppVue from "@/App.vue";
import { render, screen } from "@testing-library/vue";
import { defineComponent } from "vue";
import { createRouter, createWebHistory } from "vue-router";

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
  routes: [{ path: "/about", component: defineComponent({ template: `<div>About Page</div>` }) }]
});
describe("App", () => {
  it("should render about page(route) and call setInitialTheme on load of about page", async () => {
    router.push("/about");
    await router.isReady();

    render(AppVue, {
      global: {
        plugins: [router],
        stubs: {
          AppNav: true
        }
      }
    });

    expect(screen.getByText(/about page/i)).toBeVisible();
    expect(mockedThemeValues.setInitialTheme).toHaveBeenCalled();
  });
});
