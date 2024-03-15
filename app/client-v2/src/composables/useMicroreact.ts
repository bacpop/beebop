import { getApiUrl } from "@/config";
import { useProjectStore } from "@/stores/projectStore";
import { useUserStore } from "@/stores/userStore";
import type { ApiResponse } from "@/types/projectTypes";
import { mande } from "mande";
import { useToast } from "primevue/usetoast";
import { ref } from "vue";

export const useMicroreact = () => {
  const microReactApi = mande(`${getApiUrl()}/microreactURL`, { credentials: "include" });
  const projectStore = useProjectStore();
  const userStore = useUserStore();
  const isMicroReactDialogVisible = ref(false);
  const microReactTokenInput = ref("");
  const hasMicroReactError = ref(false);
  const toast = useToast();

  const onMicroReactVisit = async (cluster: number) => {
    if (!userStore.microreactToken) {
      isMicroReactDialogVisible.value = true;
      return;
    }
    try {
      const res = await microReactApi.post<ApiResponse<{ cluster: string; url: string }>>({
        cluster,
        apiToken: userStore.microreactToken,
        projectHash: projectStore.project.hash
      });
      window.open(res.data.url, "_blank");
    } catch (error) {
      console.error(error);

      toast.add({
        severity: "error",
        summary: "Error Occurred",
        detail: "Try again later or update your Microreact token.",
        life: 3000
      });
    }
  };

  const saveMicroreactToken = async (cluster: number) => {
    try {
      const res = await microReactApi.post<ApiResponse<{ cluster: string; url: string }>>({
        cluster,
        apiToken: microReactTokenInput.value,
        projectHash: projectStore.project.hash
      });

      isMicroReactDialogVisible.value = false;
      userStore.microreactToken = microReactTokenInput.value;
      window.open(res.data.url, "_blank");
    } catch (error) {
      console.log(error);
      hasMicroReactError.value = true;
    }
  };

  return {
    onMicroReactVisit,
    saveMicroreactToken,
    isMicroReactDialogVisible,
    microReactTokenInput,
    hasMicroReactError
  };
};
