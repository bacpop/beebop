import { getApiUrl } from "@/config";
import { useProjectStore } from "@/stores/projectStore";
import { useUserStore } from "@/stores/userStore";
import type { ApiResponse } from "@/types/projectTypes";
import { mande } from "mande";
import { ref } from "vue";
import { useToastService } from "./useToastService";

export const useMicroreact = () => {
  const microReactApi = mande(`${getApiUrl()}/microreactURL`, { credentials: "include" });
  const projectStore = useProjectStore();
  const userStore = useUserStore();
  const isMicroReactDialogVisible = ref(false);
  const hasMicroReactError = ref(false);
  const isFetchingMicroreactUrl = ref(false);
  const { showErrorToast } = useToastService();

  const closeDialog = () => {
    isMicroReactDialogVisible.value = false;
    hasMicroReactError.value = false;
  };
  const onMicroReactVisit = async (cluster: string) => {
    if (!userStore.microreactToken) {
      isMicroReactDialogVisible.value = true;
      return;
    }
    isFetchingMicroreactUrl.value = true;
    try {
      const res = await microReactApi.post<ApiResponse<{ cluster: string; url: string }>>({
        cluster,
        apiToken: userStore.microreactToken,
        projectHash: projectStore.project.hash
      });

      isFetchingMicroreactUrl.value = false;
      window.open(res.data.url, "_blank");
    } catch (error) {
      isFetchingMicroreactUrl.value = false;
      console.error(error);
      showErrorToast("Refresh Page or try updating your Microreact token from the menu.");
    }
  };

  const saveMicroreactToken = async (cluster: string, token: string) => {
    isFetchingMicroreactUrl.value = true;
    try {
      const res = await microReactApi.post<ApiResponse<{ cluster: string; url: string }>>({
        cluster,
        apiToken: token,
        projectHash: projectStore.project.hash
      });

      isFetchingMicroreactUrl.value = false;
      isMicroReactDialogVisible.value = false;
      hasMicroReactError.value = false;
      userStore.microreactToken = token;

      return res.data.url;
    } catch (error) {
      isFetchingMicroreactUrl.value = false;
      console.log(error);
      hasMicroReactError.value = true;
    }
  };

  return {
    closeDialog,
    onMicroReactVisit,
    saveMicroreactToken,
    isMicroReactDialogVisible,
    hasMicroReactError,
    isFetchingMicroreactUrl
  };
};
