<script setup lang="ts">
import { useProjectStore } from "@/stores/projectStore";
import ProjectDataTable from "@/components/ProjectView/ProjectDataTable.vue";
import { ref } from "vue";

const store = useProjectStore();
const tableIsHovered = ref(false);
</script>

<template>
  <FileUpload custom-upload auto @uploader="store.onFilesUpload($event.files)" :multiple="true" accept=".fa, .fasta">
    <template #header="{ chooseCallback }">
      <div class="flex flex-wrap justify-content-between align-items-center flex-1 gap-2">
        <Button label="Upload" outlined icon="pi pi-upload" @click="chooseCallback()" />
        <Button label="Run Analysis" outlined @click="store.runAnalysis" :disabled="!store.isReadyToRun" />
      </div>
    </template>
    <template #empty>
      <div
        v-if="store.project.samples.length > 0"
        @dragover="tableIsHovered = true"
        @dragleave="tableIsHovered = false"
        @drop="tableIsHovered = false"
        @dragenter.prevent
        :class="['mb-2', { 'opacity-20': tableIsHovered }]"
      >
        <ProjectDataTable>
          <template #extra-cols>
            <Column>
              <template #body="props">
                <Button
                  icon="pi pi-times"
                  @click="store.removeUploadedFile(props.index)"
                  outlined
                  rounded
                  size="small"
                  severity="danger"
                  aria-label="`Remove ${props.rowData.name}`"
                  :disabled="!store.isReadyToRun"
                />
              </template>
            </Column>
          </template>
        </ProjectDataTable>
      </div>
      <div v-else class="flex align-items-center justify-content-center flex-column p-5">
        <i class="pi pi-upload border-2 border-circle p-5 text-8xl text-400 border-400" />
        <p class="mt-4 mb-0">Drag and drop files to here to upload.</p>
      </div>
      <div
        :class="[
          'justify-content-center align-items-center text-primary',
          {
            flex: tableIsHovered,
            hidden: !tableIsHovered
          }
        ]"
      >
        <Tag icon="pi pi-upload" severity="info" value="Drop files to upload"></Tag>
      </div>
    </template>
  </FileUpload>
</template>
