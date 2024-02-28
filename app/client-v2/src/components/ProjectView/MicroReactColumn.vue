<script setup lang="ts">
import { useProjectStore } from "@/stores/projectStore";
import { type ProjectSample, AnalysisType } from "@/types/projectTypes";

const store = useProjectStore();
const props = defineProps<{
  data: ProjectSample;
}>();
</script>

<template>
  <div v-if="store.analysisStatus.microreact === 'finished'" class="flex gap-2">
    <Button
      outlined
      icon="pi pi-download"
      @click="props.data.cluster && store.downloadZip(AnalysisType.MICROREACT, props.data.cluster)"
      :disabled="!props.data.cluster"
      v-tooltip.top="'Download zip'"
    />
    <!-- TODO: implement to microreact site -->
    <Button
      outlined
      icon="pi pi-arrow-right"
      label="Visit"
      @click="props.data.cluster && store.onMicroReactVisit(props.data.cluster)"
      :disabled="!props.data.cluster"
    />
  </div>
  <Tag v-else-if="store.analysisStatus.microreact === 'failed'" value="failed" severity="danger" />
  <Tag v-else :value="store.analysisStatus.microreact" severity="warning" />
</template>
