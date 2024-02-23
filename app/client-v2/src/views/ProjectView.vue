<script setup lang="ts">
import { getApiUrl } from "@/config";
import { useFetch } from "@vueuse/core";
import type { FileUploadUploaderEvent } from "primevue/fileupload";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
const route = useRoute();
const {
  data: project,
  error,
  isFetching
} = useFetch(getApiUrl() + `/project/${route.params?.id}`, {
  credentials: "include"
}).json();

const isRun = computed(() => {
  return project.value?.data?.status !== undefined;
});
// todo: all sketch and amr data is ready t
const isReadyToRun = computed(() => {
  return false;
});

const onUpload = (event: FileUploadUploaderEvent) => {
  console.log(event.files);
};
const runPopPunk = () => {
  console.log("Run Analysis");
};
</script>

<template>
  <div v-if="isFetching">Loading...</div>
  <div v-else-if="error">Error: {{ error }}</div>
  <div v-else-if="project" class="single-project-card">
    <div class="flex flex-column gap-1 mb-3">
      <span class="text-3xl font-bold">{{ project.data?.name }}</span>
      <span class="text-color-secondary">Upload genomics data and run analysis on them</span>
    </div>
    <div class="surface-card p-4 shadow-2 border-round">
      <div v-if="isRun">Genomics data</div>
      <div v-else>
        <FileUpload
          name="genomics[]"
          custom-upload
          auto
          @uploader="onUpload($event)"
          :multiple="true"
          accept=".fa, .fasta"
        >
          <template #header="{ chooseCallback }">
            <div class="flex flex-wrap justify-content-between align-items-center flex-1 gap-2">
              <Button label="Upload" outlined icon="pi pi-upload" @click="chooseCallback()" />
              <Button label="Run Analysis" outlined @click="runPopPunk" :disabled="!isReadyToRun" />
            </div>
          </template>
          <template #content="{ uploadedFiles, removeUploadedFileCallback }">
            <div v-if="uploadedFiles.length > 0">
              <h5>Completed</h5>
              <div class="flex flex-wrap p-0 sm:p-5 gap-5">
                <div
                  v-for="(file, index) of uploadedFiles"
                  :key="file.name + file.type + file.size"
                  class="card m-0 px-6 flex flex-column border-1 surface-border align-items-center gap-3"
                >
                  <div>
                    <img role="presentation" :alt="file.name" :src="file.objectURL" width="100" height="50" />
                  </div>
                  <span class="font-semibold">{{ file.name }}</span>
                  <Badge value="Completed" class="mt-3" severity="success" />
                  <Button
                    icon="pi pi-times"
                    @click="removeUploadedFileCallback(index)"
                    outlined
                    rounded
                    severity="danger"
                  />
                </div>
              </div>
            </div>
          </template>
          <template #empty>
            <div class="flex align-items-center justify-content-center flex-column p-5">
              <i class="pi pi-upload border-2 border-circle p-5 text-8xl text-400 border-400" />
              <p class="mt-4 mb-0">Drag and drop files to here to upload.</p>
            </div>
          </template>
        </FileUpload>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (min-width: 1200px) {
  .single-project-card {
    width: 1000px;
  }
}
@media (min-width: 800px) and (max-width: 1200px) {
  .single-project-card {
    width: 600px;
  }
}
</style>
