import AppVue from "@/App.vue";
import { useSpeciesStore } from "@/stores/speciesStore";
import { createTestingPinia } from "@pinia/testing";
import { render, screen } from "@testing-library/vue";
import { defineComponent } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import PrimeVue from "primevue/config";

const mockedThemeValues = {
  setInitialTheme: vitest.fn(),
  themeIcon: "some-icon",
  toggleTheme: vitest.fn()
};
vitest.mock("@/composables/useTheme", () => ({
  useTheme: () => mockedThemeValues
}));
vitest.mock("primevue/usetoast", () => ({
  useToast: vitest.fn()
}));

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: "/about", component: defineComponent({ template: `<div>About Page</div>` }) }]
});
describe("App", () => {
  it("should render about page(route) and call setInitialTheme & setSpeciesConfig on load of about page", async () => {
    router.push("/about");
    await router.isReady();

    render(AppVue, {
      global: {
        plugins: [router, createTestingPinia()],
        stubs: {
          AppNav: true
        }
      }
    });

    const speciesStore = useSpeciesStore();
    expect(screen.getByText(/about page/i)).toBeVisible();
    expect(mockedThemeValues.setInitialTheme).toHaveBeenCalled();
    expect(speciesStore.setSpeciesConfig).toHaveBeenCalled();
  });
});
