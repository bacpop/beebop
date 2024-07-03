<script setup lang="ts">
import { useProjectStore } from "@/stores/projectStore";
import { ref } from "vue";

const projectStore = useProjectStore();
const tableIsHovered = ref(false);
</script>

<template>
  <FileUpload
    custom-upload
    auto
    @uploader="projectStore.onFilesUpload($event.files)"
    :multiple="true"
    accept=".fa, .fasta"
    :disabled="projectStore.isRunning"
  >
    <template #header="{ chooseCallback }">
      <div v-if="projectStore.isRunning" class="flex-1">
        <div class="mb-2 fadein animation-duration-2000 animation-iteration-infinite">Running Analysis...</div>
        <ProgressBar style="height: 20px" :value="projectStore.analysisProgressPercentage"></ProgressBar>
      </div>
      <div v-else class="flex flex-wrap justify-content-between align-items-center flex-1 gap-2">
        <Button label="Upload" outlined icon="pi pi-upload" @click="chooseCallback()" />
        <Button
          label="Run Analysis"
          outlined
          @click="projectStore.runAnalysis"
          :disabled="!projectStore.isReadyToRun"
        />
      </div>
    </template>
    <template #empty>
      <div
        v-if="projectStore.project.samples.length > 0"
        @dragover="tableIsHovered = true"
        @dragleave="tableIsHovered = false"
        @drop="tableIsHovered = false"
        @dragenter.prevent
        :class="['mb-2', { 'opacity-20': tableIsHovered && !projectStore.isRunning }]"
        data-testid="drop-zone"
      >
        <slot />
      </div>
      <div v-else class="flex align-items-center justify-content-center flex-column p-5">
        <i class="pi pi-upload border-2 border-circle p-5 text-8xl text-400 border-400" />
        <p class="mt-4 mb-0">Drag and drop files to here to upload.</p>
      </div>
      <div
        :class="[
          'justify-content-center align-items-center text-primary',
          tableIsHovered && !projectStore.isRunning ? 'flex' : 'hidden'
        ]"
        data-testid="drop-zone-info"
      >
        <Tag icon="pi pi-upload" severity="info" value="Drop files to upload"></Tag>
      </div>
    </template>
  </FileUpload>
</template>
