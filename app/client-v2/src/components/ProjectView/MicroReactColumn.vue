<script setup lang="ts">
import { useMicroreact } from "@/composables/useMicroreact";
import { useProjectStore } from "@/stores/projectStore";
import { type ProjectSample, AnalysisType } from "@/types/projectTypes";
import Toast from "primevue/toast";

const props = defineProps<{
  data: ProjectSample;
}>();
// todo: make into composable & clean up logic
const projectStore = useProjectStore();
const { hasMicroReactError, isMicroReactDialogVisible, microReactTokenInput, onMicroReactVisit, saveMicroreactToken } =
  useMicroreact();
</script>

<template>
  <Toast />
  <Dialog
    v-if="props.data.cluster"
    v-model:visible="isMicroReactDialogVisible"
    modal
    :draggable="false"
    header="Submit Microreact Token"
    :style="{ width: '30rem' }"
    :class="{ 'border-red-500': hasMicroReactError }"
  >
    <span class="p-text-secondary block mb-4">
      Please submit a Microreact token so a URL can be generated.<br />
      You can find your token in your
      <a
        class="text-primary no-underline hover:underline font-semibold"
        href="https://microreact.org/my-account/settings"
        target="_blank"
      >
        Microreact Account Settings</a
      >.</span
    >
    <div class="flex flex-column gap-2 mb-3">
      <label for="microreact token" class="font-medium">Token</label>
      <InputText
        v-model="microReactTokenInput"
        id="microreact token"
        class="flex-auto"
        autocomplete="off"
        :invalid="hasMicroReactError"
        aria-errormessage="token-error"
        placeholder="Enter token..."
      />
      <small v-if="hasMicroReactError" id="token-error" class="text-red-500"
        >An error occurred, ensure the token is correct and try again</small
      >
    </div>
    <div class="flex justify-content-end gap-2">
      <Button type="button" label="Cancel" severity="secondary" @click="isMicroReactDialogVisible = false"></Button>
      <Button type="button" label="Save & Visit" @click="saveMicroreactToken(props.data.cluster)"></Button>
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
      @click="props.data.cluster && onMicroReactVisit(props.data.cluster)"
      :disabled="!props.data.cluster"
    />
  </div>
  <Tag v-else-if="projectStore.project.status?.microreact === 'failed'" value="failed" severity="danger" />
  <Tag v-else :value="projectStore.project.status?.microreact" severity="warning" />
</template>
