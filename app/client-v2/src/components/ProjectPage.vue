<script setup lang="ts">
import { useProjectStore } from "@/stores/projectStore";
import { AnalysisType, WorkerResponseValueTypes } from "@/types/projectTypes";
import ProgressBar from "primevue/progressbar";
import { useRoute } from "vue-router";

const route = useRoute();
const store = useProjectStore();
const projectFetchError = await store.getProject(route.params.id as string);
</script>

<template>
  <div v-if="projectFetchError" class="text-red-500 text-center font-semibold flex align-items-center">
    Error fetching project... Refresh or try again later
  </div>
  <div v-else class="single-project-card">
    <div class="flex flex-column gap-1 mb-3">
      <span class="text-3xl font-bold">{{ store.basicInfo.name }}</span>
      <span class="text-color-secondary">Upload genomics data and run analysis on them</span>
    </div>
    <div class="surface-card p-4 shadow-2 border-round">
      <div v-if="store.isRun">
        <DataTable :value="store.fileSamples" tableStyle="min-width: 50rem">
          <template #header>
            <div v-if="store.analysisProgressPercentage !== 100">
              <div class="mb-2">Completed {{ store.analysisProgressPercentage }} % of analysis</div>
              <ProgressBar :value="store.analysisProgressPercentage"></ProgressBar>
            </div>
            <!-- TODO: update with network tab too -->
            <div v-else class="h-1rem"></div>
          </template>
          <Column field="filename" header="File Name"></Column>
          <Column field="sketch" header="Sketch">
            <template #body="props">
              <Tag v-if="props.data.sketch" value="done" severity="success" />
              <Tag v-else value="pending" severity="warning" />
            </template>
          </Column>
          <!-- TODO: AMR display   -->
          <Column field="amr" header="AMR">
            <template #body="props">
              <Tag v-if="props.data.amr" value="done" severity="success" />
              <Tag v-else value="pending" severity="warning" />
            </template>
          </Column>
          <Column field="cluster" header="Cluster #">
            <template #body="props">
              <span v-if="props.data.cluster"> {{ props.data.cluster }}</span>
              <Tag v-else value="pending" severity="warning" /> </template
          ></Column>
          <!-- tooltips and dont allow click after first download -->
          <Column header="Network">
            <template #body="props">
              <Button
                v-if="store.analysisStatus.network === 'finished'"
                outlined
                icon="pi pi-download"
                @click="store.downloadZip(AnalysisType.NETWORK, props.data.cluster)"
              />
              <Tag v-else-if="store.analysisStatus.network === 'failed'" value="failed" severity="danger" />
              <Tag v-else :value="store.analysisStatus.network" severity="warning" />
            </template>
          </Column>
          <Column header="Microreact">
            <template #body="props">
              <div v-if="store.analysisStatus.microreact === 'finished'" class="flex gap-2">
                <Button
                  outlined
                  icon="pi pi-download"
                  @click="store.downloadZip(AnalysisType.MICROREACT, props.data.cluster)"
                />
                <!-- TODO: implement to microreact site -->
                <Button outlined icon="pi pi-arrow-right" label="Visit" @click="store.onMicroReactVisit" />
              </div>
              <Tag v-else-if="store.analysisStatus.microreact === 'failed'" value="failed" severity="danger" />
              <Tag v-else :value="store.analysisStatus.microreact" severity="warning" />
            </template>
          </Column>
        </DataTable>
      </div>
      <div v-else>
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
            <div v-if="store.fileSamples.length > 0">
              <DataTable :value="store.fileSamples" tableStyle="min-width: 50rem">
                <Column field="filename" header="File Name"></Column>
                <Column field="sketch" header="Sketch">
                  <template #body="props">
                    <Tag v-if="props.data.sketch" value="done" severity="success" />
                    <Tag v-else value="pending" severity="warning" />
                  </template>
                </Column>
                <!-- TODO: AMR display   -->
                <Column field="amr" header="AMR">
                  <template #body="props">
                    <Tag v-if="props.data.amr" value="done" severity="success" />
                    <Tag v-else value="pending" severity="warning" />
                  </template>
                </Column>
                <Column>
                  <template #body="props">
                    <Button
                      icon="pi pi-times"
                      @click="store.removeUploadedFile(props.index)"
                      disabled
                      outlined
                      rounded
                      size="small"
                      severity="danger"
                    />
                  </template>
                </Column>
              </DataTable>
            </div>
            <div v-else class="flex align-items-center justify-content-center flex-column p-5">
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
    width: 1100px;
  }
}
</style>
