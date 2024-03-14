<script setup lang="ts">
import { getApiUrl } from "@/config";
import { useProjectStore } from "@/stores/projectStore";
import { useUserStore } from "@/stores/userStore";
import { type ProjectSample, AnalysisType, type ApiResponse } from "@/types/projectTypes";
import { mande } from "mande";
import { ref } from "vue";

const props = defineProps<{
  data: ProjectSample;
}>();
// todo: make into composable & clean up logic
const microReactApi = mande(`${getApiUrl()}/microreactURL`, { credentials: "include" });
const projectStore = useProjectStore();
const userStore = useUserStore();
const isMicroReactDialogVisible = ref(false);
const microReactTokenInput = ref("");
const microReactError = ref(false);

const onMicroReactVisit = async () => {
  if (userStore.microreactToken) {
    try {
      const res = await microReactApi.post<ApiResponse<{ cluster: string; url: string }>>({
        cluster: props.data.cluster,
        apiToken: userStore.microreactToken,
        projectHash: projectStore.project.hash
      });
      window.open(res.data.url, "_blank");
    } catch (error) {
      console.error(error);
    }
  } else {
    isMicroReactDialogVisible.value = true;
  }
};

const saveMicroreactToken = async () => {
  if (microReactTokenInput.value) {
    try {
      const res = await microReactApi.post<ApiResponse<{ cluster: string; url: string }>>({
        cluster: props.data.cluster,
        apiToken: microReactTokenInput.value,
        projectHash: projectStore.project.hash
      });

      isMicroReactDialogVisible.value = false;
      userStore.microreactToken = microReactTokenInput.value;

      window.open(res.data.url, "_blank");
    } catch (error) {
      microReactError.value = true;
    }
  }
};
</script>

<template>
  <Dialog
    v-model:visible="isMicroReactDialogVisible"
    modal
    :draggable="false"
    header="Submit Microreact Token"
    :style="{ width: '30rem' }"
  >
    <span class="p-text-secondary block mb-4">
      Please submit a Microreact token so a url can be generated.<br />
      You can find your token in your
      <a href="https://microreact.org/my-account/settings" target="_blank"> Microreact Account Settings</a>.</span
    >
    <div class="flex flex-column gap-2 mb-3">
      <label for="microreact token" class="font-semibold">Token</label>
      <InputText
        v-model="microReactTokenInput"
        id="microreact token"
        class="flex-auto"
        autocomplete="off"
        :invalid="microReactError"
        aria-errormessage="token-error"
      />
      <small v-if="microReactError" id="token-error" class="text-red-500"
        >Incorrect token, ensure it is correct and try again</small
      >
    </div>
    <div class="flex justify-content-end gap-2">
      <Button type="button" label="Cancel" severity="secondary" @click="isMicroReactDialogVisible = false"></Button>
      <Button type="button" label="Save" @click="saveMicroreactToken"></Button>
    </div>
  </Dialog>
  <div v-if="projectStore.project.status?.microreact === 'finished'" class="flex gap-2">
    <Button
      outlined
      icon="pi pi-download"
      aria-label="Download microreact zip"
      @click="props.data.cluster && projectStore.downloadZip(AnalysisType.MICROREACT, props.data.cluster)"
      :disabled="!props.data.cluster"
      v-tooltip.top="'Download zip'"
    />
    <!-- TODO: implement to microreact site -->
    <Button
      outlined
      icon="pi pi-arrow-right"
      label="Visit"
      @click="props.data.cluster && onMicroReactVisit()"
      :disabled="!props.data.cluster"
    />
  </div>
  <Tag v-else-if="projectStore.project.status?.microreact === 'failed'" value="failed" severity="danger" />
  <Tag v-else :value="projectStore.project.status?.microreact" severity="warning" />
</template>
