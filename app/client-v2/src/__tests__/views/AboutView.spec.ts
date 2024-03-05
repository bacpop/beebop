import AboutView from "@/views/AboutView.vue";
import { render, screen } from "@testing-library/vue";
import { expect } from "vitest";

describe("About view", () => {
  it("should render page with about info", () => {
    render(AboutView);

    expect(screen.getByText(/About/)).toBeInTheDocument();
  });
});
