<script setup lang="ts">
import ProjectDataTable from "@/components/ProjectView/ProjectDataTable.vue";
import { useMicroreact } from "@/composables/useMicroreact";
import { useProjectStore } from "@/stores/projectStore";
import { useUserStore } from "@/stores/userStore";
import { AnalysisType } from "@/types/projectTypes";
import { hasSampleFailed, hasSamplePassed } from "@/utils/projectStatus";
import { ref } from "vue";

const projectStore = useProjectStore();
const userStore = useUserStore();
const hasVisitedNetworkTab = ref(false);
const { closeDialog, hasMicroReactError, isMicroReactDialogVisible, saveMicroreactToken, isFetchingMicroreactUrl } =
  useMicroreact();

// cache network graphs render after visiting it once
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
  <ProjectFileUpload>
    <TabView @update:active-index="tabChange">
      <TabPanel header="Samples">
        <ProjectDataTable>
          <template #extra-cols>
            <Column field="cluster" header="Cluster">
              <template #body="{ data }">
                <span v-if="!data.hasRun || hasSamplePassed(projectStore.project.status?.assign, data.cluster)">
                  <em v-if="!data.cluster">not run</em>
                  {{ data.cluster }}
                </span>
                <Tag
                  v-else-if="hasSampleFailed(projectStore.project.status?.assign, data.cluster)"
                  v-tooltip.top="`${data.failReasons ?? 'Invalid Sample'}`"
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
          </template>
        </ProjectDataTable>
      </TabPanel>
      <TabPanel header="Network" :disabled="projectStore.project.status?.network !== 'finished'">
        <NetworkTab v-if="projectStore.project.status?.network === 'finished' && hasVisitedNetworkTab" />
      </TabPanel>
    </TabView>
  </ProjectFileUpload>
</template>
