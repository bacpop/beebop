<script setup lang="ts">
import { useMicroreact } from "@/composables/useMicroreact";
import { useProjectStore } from "@/stores/projectStore";
import { type ProjectSample, AnalysisType } from "@/types/projectTypes";
import Toast from "primevue/toast";
import Dialog from "primevue/dialog";
const props = defineProps<{
  data: ProjectSample;
}>();
// todo: make into composable & clean up logic
const projectStore = useProjectStore();
const {
  hasMicroReactError,
  isMicroReactDialogVisible,
  microReactTokenInput,
  onMicroReactVisit,
  saveMicroreactToken,
  isFetchingMicroreactUrl
} = useMicroreact();
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
    <div class="flex flex-column gap-2 p-text-secondary block mb-4">
      <div>Please submit a Microreact token so a URL can be generated and you can be directed to Microreact.</div>
      <div>
        You can find your token in your
        <a
          class="text-primary no-underline hover:underline font-semibold"
          href="https://microreact.org/my-account/settings"
          target="_blank"
        >
          Microreact Account Settings</a
        >.
      </div>
    </div>
    <div class="flex flex-column gap-2 mb-3">
      <label for="microreact-token-input" class="font-medium">Token</label>
      <InputText
        v-model="microReactTokenInput"
        id="microreact-token-input"
        class="flex-auto"
        autocomplete="off"
        :invalid="hasMicroReactError"
        aria-errormessage="token-error"
        placeholder="Enter token..."
        required
      />
      <small v-if="hasMicroReactError" id="token-error" class="text-red-500"
        >An error occurred. Please ensure the token is correct and try again.</small
      >
    </div>
    <div class="flex justify-content-end gap-2">
      <Button type="button" label="Cancel" severity="secondary" @click="isMicroReactDialogVisible = false"></Button>
      <Button
        type="button"
        label="Save & Visit"
        :disabled="!microReactTokenInput"
        :loading="isFetchingMicroreactUrl"
        @click="saveMicroreactToken(props.data.cluster)"
      ></Button>
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
    <Button
      outlined
      icon="pi pi-arrow-right"
      label="Visit"
      @click="props.data.cluster && onMicroReactVisit(props.data.cluster)"
      :loading="isFetchingMicroreactUrl"
      :disabled="!props.data.cluster"
      v-tooltip.top="'Visit microreact'"
    />
  </div>
  <Tag v-else-if="projectStore.project.status?.microreact === 'failed'" value="failed" severity="danger" />
  <Tag v-else :value="projectStore.project.status?.microreact" severity="warning" />
</template>
