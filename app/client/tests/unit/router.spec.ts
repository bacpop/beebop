import router from "@/router/index";

describe("router", () => {
    const routes = router.getRoutes();

    it("defines expected routes", () => {
        expect(routes.length).toBe(3);
        expect(routes[0].name).toBe("home");
        expect(routes[0].path).toBe("/");

        expect(routes[1].name).toBe("about");
        expect(routes[1].path).toBe("/about");

        expect(routes[2].name).toBe("project");
        expect(routes[2].path).toBe("/project");
    });

    it("Home route loads Home component", () => {
        expect(routes[0].components.default.name).toBe("HomeView");
    });

    it("About route loads About component", async () => {
        expect(routes[1].components.default.name).toBe("AboutView");
    });

    it("Project route loads Project component", async () => {
        expect(routes[2].components.default.name).toBe("ProjectView");
    });
});
