<script setup lang="ts">
import { useMicroreact } from "@/composables/useMicroreact";
import { useProjectStore } from "@/stores/projectStore";
import { type ProjectSample, AnalysisType } from "@/types/projectTypes";
import Toast from "primevue/toast";
import MicroReactTokenDialog from "./MicroReactTokenDialog.vue";
import { hasMicroreactClusterPassed, hasMicroreactClusterFailed, getMicroreactClusterStatus } from "@/utils/projectStatus";
const props = defineProps<{
  data: ProjectSample;
}>();
const projectStore = useProjectStore();
const {
  closeDialog,
  hasMicroReactError,
  isMicroReactDialogVisible,
  onMicroReactVisit,
  saveMicroreactToken,
  isFetchingMicroreactUrl
} = useMicroreact();

const onSaveMicroreactToken = async (cluster: string, token: string) => {
  const url = await saveMicroreactToken(cluster, token);
  if (url) window.open(url, "_blank");
};

</script>

<template>
  <Toast />
  <MicroReactTokenDialog
    v-if="props.data.cluster"
    :isMicroReactDialogVisible="isMicroReactDialogVisible"
    :hasMicroReactError="hasMicroReactError"
    :isFetchingMicroreactUrl="isFetchingMicroreactUrl"
    header="Submit Microreact Token"
    text="Please submit a Microreact token so a URL can be generated and you can be directed to Microreact"
    @closeDialog="closeDialog"
    @saveMicroreactToken="onSaveMicroreactToken(props.data.cluster, $event)"
  />
  <div v-if="!data.hasRun || hasMicroreactClusterPassed(projectStore.project.status?.microreactClusters, data.cluster)" class="flex gap-2">
    <Button
      outlined
      icon="pi pi-download"
      aria-label="Download microreact zip"
      @click="data.cluster && projectStore.downloadZip(AnalysisType.MICROREACT, data.cluster)"
      :disabled="!data.cluster"
      v-tooltip.top="'Download zip'"
    />
    <Button
      outlined
      icon="pi pi-arrow-right"
      label="Visit"
      @click="data.cluster && onMicroReactVisit(data.cluster)"
      :loading="isFetchingMicroreactUrl"
      :disabled="!data.cluster"
      v-tooltip.top="'Visit microreact'"
    />
  </div>
  <Tag
    v-else-if="hasMicroreactClusterFailed(projectStore.project.status, data.cluster)"
    value="failed"
    severity="danger"
  />
  <Tag v-else :value="getMicroreactClusterStatus(projectStore.project.status, data.cluster)" severity="warning" />
</template>
