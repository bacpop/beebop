<script setup lang="ts">
import { useProjectStore } from "@/stores/projectStore";
import ProjectDataTable from "@/components/ProjectView/ProjectDataTable.vue";
import { ref } from "vue";

const store = useProjectStore();
const tableIsHovered = ref(false);
</script>

<template>
  <FileUpload
    name="genomics[]"
    custom-upload
    auto
    @uploader="store.onFilesUpload($event.files)"
    :multiple="true"
    accept=".fa, .fasta"
  >
    <template #header="{ chooseCallback }">
      <div class="flex flex-wrap justify-content-between align-items-center flex-1 gap-2">
        <Button label="Upload" outlined icon="pi pi-upload" @click="chooseCallback()" />
        <Button label="Run Analysis" outlined @click="store.runAnalysis" :disabled="!store.isReadyToRun" />
      </div>
    </template>
    <template #content>
      <div
        v-if="store.fileSamples.length > 0"
        @dragover="tableIsHovered = true"
        @dragleave="tableIsHovered = false"
        @drop="tableIsHovered = false"
        :class="{ 'opacity-20': tableIsHovered }"
      >
        <ProjectDataTable>
          <template #extra-cols>
            <Column>
              <!-- TODO: have to add endpoint to remove stored data as well -->
              <!-- <template #body="props">
                <Button
                  icon="pi pi-times"
                  @click="store.removeUploadedFile(props.index)"
                  outlined
                  rounded
                  size="small"
                  severity="danger"
                />
              </template> -->
            </Column>
          </template>
        </ProjectDataTable>
      </div>
      <div v-else class="flex align-items-center justify-content-center flex-column p-5">
        <i class="pi pi-upload border-2 border-circle p-5 text-8xl text-400 border-400" />
        <p class="mt-4 mb-0">Drag and drop files to here to upload.</p>
      </div>
    </template>
  </FileUpload>
</template>
