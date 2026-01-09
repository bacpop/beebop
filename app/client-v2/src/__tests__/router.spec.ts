import router from "@/router";
import { useUserStore } from "@/stores/userStore";
import { createTestingPinia } from "@pinia/testing";
import { flushPromises } from "@vue/test-utils";

describe("Router", () => {
  it("should get user and not redirect on page that does not require auth", async () => {
    const testPinia = createTestingPinia();
    const userStore = useUserStore(testPinia);

    router.push("/login");
    await router.isReady();

    expect(userStore.getUser).toHaveBeenCalled();
  });
  it("should redirect to login page if user is not authenticated and page requires auth", async () => {
    const testPinia = createTestingPinia();
    const userStore = useUserStore(testPinia);
    // @ts-expect-error getter is readonly
    userStore.isAuthenticated = false;

    router.push("/");
    await router.isReady();

    expect(router.currentRoute.value.path).toBe("/login");
  });
  it("should not redirect to login page if user is authenticated and page requires auth", async () => {
    const testPinia = createTestingPinia();
    const userStore = useUserStore(testPinia);
    // @ts-expect-error getter is readonly
    userStore.isAuthenticated = true;

    router.push("/");
    await router.isReady();

    await flushPromises();

    expect(router.currentRoute.value.path).toBe("/");
  });
  it("should be created with correct configuration", () => {
    expect(router).toBeDefined();
    expect(router.getRoutes()).toHaveLength(6);
  });

  it("should define a NotFound route", () => {
    const route = router.getRoutes().find((route) => route?.name === "NotFound");

    expect(route).toBeDefined();
    expect(route?.meta.requiresAuth).toBeUndefined();
  });

  it("should define a home route", () => {
    const route = router.getRoutes().find((route) => route?.name === "home");

    expect(route).toBeDefined();
    expect(route?.meta.requiresAuth).toBe(true);
  });

  it("should define an about route", () => {
    const route = router.getRoutes().find((route) => route?.name === "about");

    expect(route?.meta.requiresAuth).toBeUndefined();
    expect(route).toBeDefined();
  });

  it("should define a project route", () => {
    const route = router.getRoutes().find((route) => route?.name === "project");

    expect(route).toBeDefined();
    expect(route?.meta.requiresAuth).toBe(true);
  });

  it("should define a login route", () => {
    const route = router.getRoutes().find((route) => route?.name === "login");

    expect(route?.meta.requiresAuth).toBeUndefined();
    expect(route).toBeDefined();
  });

  it("should render a metadata route", () => {
    const route = router.getRoutes().find((route) => route?.name === "metadata");

    expect(route).toBeDefined();
    expect(route?.meta.requiresAuth).toBe(false);
  });
});
