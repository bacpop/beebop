<script setup lang="ts">
import MicroReactColumn from "@/components/ProjectView/MicroReactColumn.vue";
import ProjectDataTable from "@/components/ProjectView/ProjectDataTable.vue";
import { useProjectStore } from "@/stores/projectStore";
import { AnalysisType } from "@/types/projectTypes";
import NetworkTab from "./NetworkTab.vue";
import { ref } from "vue";
import { useMicroreact } from "@/composables/useMicroreact";
import { useUserStore } from "@/stores/userStore";

const projectStore = useProjectStore();
const userStore = useUserStore();
const hasVisitedNetworkTab = ref(false);
const { hasMicroReactError, isMicroReactDialogVisible, saveMicroreactToken, isFetchingMicroreactUrl } = useMicroreact();

const tabChange = (num: number) => {
  if (num == 1 && !hasVisitedNetworkTab.value) {
    hasVisitedNetworkTab.value = true;
  }
};
</script>

<template>
  <MicroReactTokenDialog
    v-if="projectStore.project.samples[0].cluster"
    :isMicroReactDialogVisible="isMicroReactDialogVisible"
    :hasMicroReactError="hasMicroReactError"
    :isFetchingMicroreactUrl="isFetchingMicroreactUrl"
    :header="`${userStore.microreactToken ? 'Update' : 'Submit'} Microreact Token`"
    :text="`Please ${userStore.microreactToken ? 'update' : 'submit'} a Microreact token so Microreact graphs can be visited.`"
    @closeDialog="isMicroReactDialogVisible = false"
    @saveMicroreactToken="saveMicroreactToken(projectStore.project.samples[0].cluster, $event)"
  />
  <div v-if="projectStore.analysisProgressPercentage !== 100">
    <div class="mb-2 fadein animation-duration-2000 animation-iteration-infinite">Running Analysis...</div>
    <ProgressBar :value="projectStore.analysisProgressPercentage"></ProgressBar>
  </div>
  <TabView @update:active-index="tabChange">
    <TabPanel header="Samples">
      <ProjectDataTable>
        <template #extra-cols>
          <Column field="cluster" header="Cluster">
            <template #body="{ data }">
              <span v-if="data.cluster"> {{ data.cluster }}</span>
              <Tag v-else value="pending" severity="warning" /> </template
          ></Column>
          <Column header="Network">
            <template #body="{ data }">
              <Button
                v-if="projectStore.project.status?.network === 'finished'"
                outlined
                icon="pi pi-download"
                @click="data.cluster && projectStore.downloadZip(AnalysisType.NETWORK, data.cluster)"
                :disabled="!data.cluster"
                aria-label="Download network zip"
                v-tooltip.top="'Download zip'"
              />
              <Tag v-else-if="projectStore.project.status?.network === 'failed'" value="failed" severity="danger" />
              <Tag v-else :value="projectStore.project.status?.network" severity="warning" />
            </template>
          </Column>
          <Column>
            <template #header>
              <div class="flex align-items-center gap-2">
                <span>Microreact</span>
                <Button
                  text
                  icon="pi pi-cog"
                  @click="isMicroReactDialogVisible = true"
                  :disabled="projectStore.project.status?.microreact !== 'finished'"
                  aria-label="Update Microreact token"
                  v-tooltip.top="'Update Microreact token'"
                  size="small"
                />
              </div>
            </template>
            <template #body="{ data }">
              <MicroReactColumn :data="data" />
            </template>
          </Column>
        </template>
      </ProjectDataTable>
    </TabPanel>
    <TabPanel header="Network" :disabled="projectStore.project.status?.network !== 'finished'">
      <NetworkTab v-if="projectStore.project.status?.network === 'finished' && hasVisitedNetworkTab" />
    </TabPanel>
  </TabView>
</template>
