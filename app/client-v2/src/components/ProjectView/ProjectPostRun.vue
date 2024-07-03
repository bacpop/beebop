<script setup lang="ts">
import { useProjectStore } from "@/stores/projectStore";
import ProjectDataTable from "@/components/ProjectView/ProjectDataTable.vue";
import { ref } from "vue";
import { useUserStore } from "@/stores/userStore";
import { useMicroreact } from "@/composables/useMicroreact";
import { AnalysisType } from "@/types/projectTypes";
import { hasSampleFailed, hasSamplePassed } from "@/utils/projectStatus";

const store = useProjectStore();
const tableIsHovered = ref(false);
const projectStore = useProjectStore();
const userStore = useUserStore();
const hasVisitedNetworkTab = ref(false);
const { closeDialog, hasMicroReactError, isMicroReactDialogVisible, saveMicroreactToken, isFetchingMicroreactUrl } =
  useMicroreact();

const tabChange = (num: number) => {
  if (num == 1 && !hasVisitedNetworkTab.value) {
    hasVisitedNetworkTab.value = true;
  }
};
const getMicroreactSettingsTooltip = () => {
  if (projectStore.project.status?.microreact !== "finished") {
    return "Microreact settings will become available when Microreact data has been generated";
  }
  return `${userStore.microreactToken ? "Update" : "Set"} Microreact token`;
};
</script>

<template>
  <MicroReactTokenDialog
    v-if="projectStore.project.samples?.length > 0 && projectStore.project.samples[0]?.cluster"
    :isMicroReactDialogVisible="isMicroReactDialogVisible"
    :hasMicroReactError="hasMicroReactError"
    :isFetchingMicroreactUrl="isFetchingMicroreactUrl"
    :header="`${userStore.microreactToken ? 'Update or Delete' : 'Save'} Microreact Token`"
    :text="`${userStore.microreactToken ? 'Update token to change to utilize another Microreact account, or delete token if you no longer want to use Microreact.' : 'Please save Microreact token so Microreact graphs can be visited.'}`"
    @closeDialog="closeDialog"
    @saveMicroreactToken="saveMicroreactToken(projectStore.project.samples[0].cluster, $event)"
  />
  <FileUpload
    custom-upload
    auto
    @uploader="store.onFilesUpload($event.files)"
    :multiple="true"
    accept=".fa, .fasta"
    :disabled="store.isRunning"
  >
    <template #header="{ chooseCallback }">
      <div v-if="store.isRunning" class="flex-1">
        <div class="mb-2 fadein animation-duration-2000 animation-iteration-infinite">Running Analysis...</div>
        <ProgressBar style="height: 20px" :value="projectStore.analysisProgressPercentage"></ProgressBar>
      </div>
      <div v-else class="flex flex-wrap justify-content-between align-items-center flex-1 gap-2">
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
        <TabView @update:active-index="tabChange">
          <TabPanel header="Samples">
            <ProjectDataTable>
              <template #extra-cols>
                <Column field="cluster" header="Cluster">
                  <template #body="{ data }">
                    <span v-if="!data.hasRun || hasSamplePassed(projectStore.project.status?.assign, data.cluster)">
                      {{ data.cluster }}</span
                    >
                    <Tag
                      v-else-if="hasSampleFailed(projectStore.project.status?.assign, data.cluster)"
                      v-tooltip.top="`${data.failReason ?? 'Invalid Sample'}`"
                      value="failed"
                      severity="danger"
                    />
                    <Tag v-else value="pending" severity="warning" />
                  </template>
                </Column>
                <Column header="Network">
                  <template #body="{ data }">
                    <Button
                      v-if="!data.hasRun || hasSamplePassed(projectStore.project.status?.network, data.cluster)"
                      outlined
                      icon="pi pi-download"
                      @click="data.cluster && projectStore.downloadZip(AnalysisType.NETWORK, data.cluster)"
                      :disabled="!data.cluster"
                      aria-label="Download network zip"
                      v-tooltip.top="'Download zip'"
                    />
                    <Tag
                      v-else-if="hasSampleFailed(projectStore.project.status?.network, data.cluster)"
                      value="failed"
                      severity="danger"
                    />
                    <Tag v-else :value="projectStore.project.status?.network" severity="warning" />
                  </template>
                </Column>
                <Column>
                  <template #header>
                    <div class="flex align-items-center gap-2">
                      <span>Microreact</span>
                      <div v-tooltip.top="getMicroreactSettingsTooltip()">
                        <Button
                          text
                          icon="pi pi-cog"
                          @click="isMicroReactDialogVisible = true"
                          :disabled="projectStore.project.status?.microreact !== 'finished'"
                          aria-label="Microreact settings"
                          size="small"
                        />
                      </div>
                    </div>
                  </template>
                  <template #body="{ data }">
                    <MicroReactColumn :data="data" />
                  </template>
                </Column>

                <Column>
                  <template #body="props">
                    <Button
                      icon="pi pi-times"
                      @click="store.removeUploadedFile(props.index)"
                      outlined
                      rounded
                      size="small"
                      severity="danger"
                      :aria-label="`Remove ${props.data.filename}`"
                      :disabled="!store.isReadyToRun || store.isRunning"
                    />
                  </template>
                </Column>
              </template>
            </ProjectDataTable>
          </TabPanel>
          <TabPanel header="Network" :disabled="projectStore.project.status?.network !== 'finished'">
            <NetworkTab v-if="projectStore.project.status?.network === 'finished' && hasVisitedNetworkTab" />
          </TabPanel>
        </TabView>
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
