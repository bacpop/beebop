import { userIndexUri } from "@/mocks/handlers/userHandlers";
import { MOCK_USER } from "@/mocks/mockObjects";
import { server } from "@/mocks/server";
import { useUserStore } from "@/stores/userStore";
import { HttpResponse, http } from "msw";
import { createPinia, setActivePinia } from "pinia";

describe("User Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });
  it("should set isAuthenticated to true if user has id", () => {
    const store = useUserStore();
    expect(store.isAuthenticated).toBe(false);

    store.id = "1";

    expect(store.isAuthenticated).toBe(true);
  });

  it("should update user state when getUser is called", async () => {
    const store = useUserStore();
    await store.getUser();

    expect(store.$state).toEqual(MOCK_USER);
  });
  it("should set user state to undefined if getUser fails", async () => {
    const store = useUserStore();
    server.use(http.get(userIndexUri, () => HttpResponse.error()));

    await store.getUser();

    expect(store.$state).toEqual({
      id: undefined,
      name: undefined,
      provider: undefined
    });
  });
});
