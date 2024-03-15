import { useMicroreact } from "@/composables/useMicroreact";
import { microreactUri } from "@/mocks/handlers/projectHandlers";
import { MOCK_MICROREACT_DICT } from "@/mocks/mockObjects";
import { server } from "@/mocks/server";
import { useProjectStore } from "@/stores/projectStore";
import { useUserStore } from "@/stores/userStore";
import { createTestingPinia } from "@pinia/testing";
import { flushPromises } from "@vue/test-utils";
import { HttpResponse, http } from "msw";

const mockToastAdd = vitest.fn();
vitest.mock("primevue/usetoast", () => ({
  useToast: vitest.fn(() => ({
    add: mockToastAdd
  }))
}));
describe("useMicroreact", () => {
  beforeEach(() => {
    createTestingPinia();
  });

  describe("onMicroReactVisit", () => {
    it("should set isMicroReactDialogVisible to true if userStore.microreactToken is not set", () => {
      const userStore = useUserStore();
      userStore.microreactToken = "";
      const { isMicroReactDialogVisible, onMicroReactVisit } = useMicroreact();

      expect(isMicroReactDialogVisible.value).toBe(false);

      onMicroReactVisit(1);

      expect(isMicroReactDialogVisible.value).toBe(true);
    });

    it("should call window.open with correct url from server when  userStore.microreactToken is set", async () => {
      const mockOpen = vitest.fn();
      Object.defineProperty(window, "open", { value: mockOpen });
      const userStore = useUserStore();
      userStore.microreactToken = "token";
      const { onMicroReactVisit, isFetchingMicroreactUrl } = useMicroreact();

      onMicroReactVisit(1);

      await flushPromises();

      expect(isFetchingMicroreactUrl.value).toBe(false);
      expect(mockOpen).toHaveBeenCalledWith(MOCK_MICROREACT_DICT.url, "_blank");
    });
    it("should call api with correct body and show error toast if error occurs", async () => {
      const userStore = useUserStore();
      const projectStore = useProjectStore();
      projectStore.project.hash = "hash";
      userStore.microreactToken = "token";
      const { onMicroReactVisit, isFetchingMicroreactUrl } = useMicroreact();
      server.use(
        http.post(microreactUri, async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual({
            cluster: 1,
            apiToken: "token",
            projectHash: "hash"
          });
          return HttpResponse.error();
        })
      );

      onMicroReactVisit(1);

      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalled();
      expect(isFetchingMicroreactUrl.value).toBe(false);
    });
  });
  describe("saveMicroreactToken", () => {
    it("should update state correctly and call window.open with correct url", async () => {
      const userStore = useUserStore();
      userStore.microreactToken = "";
      const mockOpen = vitest.fn();
      Object.defineProperty(window, "open", { value: mockOpen });
      const { saveMicroreactToken, isMicroReactDialogVisible, microReactTokenInput, isFetchingMicroreactUrl } =
        useMicroreact();
      isMicroReactDialogVisible.value = true;
      microReactTokenInput.value = "token";

      saveMicroreactToken(1);

      await flushPromises();

      expect(isMicroReactDialogVisible.value).toBe(false);
      expect(userStore.microreactToken).toBe("token");
      expect(mockOpen).toHaveBeenCalledWith(MOCK_MICROREACT_DICT.url, "_blank");
      expect(isFetchingMicroreactUrl.value).toBe(false);
    });

    it("should call api with correct body set hasMicroReactError to true if error occurs", async () => {
      const userStore = useUserStore();
      const projectStore = useProjectStore();
      projectStore.project.hash = "hash";
      userStore.microreactToken = "";
      const { saveMicroreactToken, microReactTokenInput, hasMicroReactError, isFetchingMicroreactUrl } =
        useMicroreact();
      microReactTokenInput.value = "token";
      server.use(
        http.post(microreactUri, async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual({
            cluster: 1,
            apiToken: "token",
            projectHash: "hash"
          });
          return HttpResponse.error();
        })
      );

      saveMicroreactToken(1);

      await flushPromises();

      expect(hasMicroReactError.value).toBe(true);
      expect(isFetchingMicroreactUrl.value).toBe(false);
    });
  });
});
