import ExternalLink from "@/components/Common/ExternalLink.vue";
import { render, screen } from "@testing-library/vue";

describe("ExternalLink", () => {
  it("should render correct href and text from props", () => {
    render(ExternalLink, {
      props: {
        href: "https://www.google.com",
        "display-text": "Google"
      }
    });

    const anchorTag = screen.getByRole("link");

    expect(anchorTag).toHaveAttribute("href", "https://www.google.com");
    expect(anchorTag).toHaveTextContent("Google");
  });
});
