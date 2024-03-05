import NotFoundViewVue from "@/views/NotFoundView.vue";
import { render, screen } from "@testing-library/vue";
import { defineComponent } from "vue";
import { createRouter, createWebHistory } from "vue-router";

vitest.mock("@/composables/useTheme", () => ({
  useTheme: vitest.fn(() => ({
    toggleTheme: vitest.fn(),
    themeIcon: "some-icon"
  }))
}));
describe("Not Found page ", () => {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: "/", component: defineComponent({ template: `<div></div>` }) },
      { path: "/about", component: defineComponent({ template: `<div></div>` }) }
    ]
  });
  it("should have routes to home and about pages", () => {
    render(NotFoundViewVue, {
      global: {
        plugins: [router]
      }
    });

    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /about/i })).toHaveAttribute("href", "/about");
  });
});
