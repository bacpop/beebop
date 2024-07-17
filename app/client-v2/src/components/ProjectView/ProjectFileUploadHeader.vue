<script setup lang="ts">
import { useProjectStore } from "@/stores/projectStore";

const projectStore = useProjectStore();
defineProps<{
  chooseCallback: () => void;
  runAnalysis: () => void;
}>();
</script>

<template>
  <div v-if="projectStore.uploadingPercentage !== null && projectStore.uploadingPercentage !== 100" class="flex-1">
    <div class="mb-2 fadein animation-duration-2000 animation-iteration-infinite">
      Sketching and calculating AMR for uploaded samples... do not exit the page; any unprocessed will not be saved.
    </div>
    <ProgressBar style="height: 20px" :value="projectStore.uploadingPercentage"></ProgressBar>
  </div>
  <div v-else-if="projectStore.isRunning" class="flex-1">
    <div class="mb-2 fadein animation-duration-2000 animation-iteration-infinite">Running Analysis...</div>
    <ProgressBar style="height: 20px" :value="projectStore.analysisProgressPercentage"></ProgressBar>
  </div>
  <div v-else class="flex flex-wrap justify-content-between align-items-center flex-1 gap-2">
    <Button label="Upload" outlined icon="pi pi-upload" @click="chooseCallback()" />
    <Button label="Run Analysis" outlined @click="runAnalysis" :disabled="!projectStore.isReadyToRun" />
  </div>
</template>
