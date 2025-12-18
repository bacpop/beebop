<script setup lang="ts">
import ProjectDataTable from "@/components/ProjectView/ProjectDataTable.vue";
import { useMicroreact } from "@/composables/useMicroreact";
import { useProjectStore } from "@/stores/projectStore";
import { useSpeciesStore } from "@/stores/speciesStore";
import { useUserStore } from "@/stores/userStore";
import { AnalysisType } from "@/types/projectTypes";
import {
  getVisualiseClusterStatus,
  hasSampleFailed,
  hasSamplePassed,
  hasVisualiseClusterFailed,
  hasVisualiseClusterPassed,
  isAnyVisualiseFinished,
  isAllVisualiseFinished,
  hasSampleFailedWithWarning,
  isSublineageUnavailable
} from "@/utils/projectStatus";
import { computed, ref } from "vue";

const projectStore = useProjectStore();
const userStore = useUserStore();
const hasVisitedNetworkTab = ref(false);
const shouldRenderNetwork = computed(() => isAllVisualiseFinished(projectStore.project.status?.visualiseClusters));
const { closeDialog, hasMicroReactError, isMicroReactDialogVisible, saveMicroreactToken, isFetchingMicroreactUrl } =
  useMicroreact();
const speciesStore = useSpeciesStore();
// cache network graphs render after visiting it once
const tabChange = (num: number) => {
  if (num == 1 && !hasVisitedNetworkTab.value) {
    hasVisitedNetworkTab.value = true;
  }
};
const getMicroreactSettingsTooltip = () => {
  if (isAnyVisualiseFinished(projectStore.project.status?.visualiseClusters)) {
    return `${userStore.microreactToken ? "Update" : "Set"} Microreact token`;
  }
  return "Microreact settings will become available when Microreact data has been generated";
};
</script>

<template>
  <MicroReactTokenDialog
    v-if="projectStore.firstAssignedCluster"
    :isMicroReactDialogVisible="isMicroReactDialogVisible"
    :hasMicroReactError="hasMicroReactError"
    :isFetchingMicroreactUrl="isFetchingMicroreactUrl"
    :header="`${userStore.microreactToken ? 'Update or Delete' : 'Save'} Microreact Token`"
    :text="`${userStore.microreactToken ? 'Update token to change to utilize another Microreact account, or delete token if you no longer want to use Microreact.' : 'Please save Microreact token so Microreact graphs can be visited.'}`"
    @closeDialog="closeDialog"
    @saveMicroreactToken="saveMicroreactToken(projectStore.firstAssignedCluster, $event)"
  />
  <ProjectFileUpload @onRunAnalysis="hasVisitedNetworkTab && (hasVisitedNetworkTab = false)">
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
                  v-else-if="
                    hasSampleFailedWithWarning(projectStore.project.status?.assign, data.cluster, data.failType)
                  "
                  v-tooltip.top="
                    `${data.failReasons?.join(', ') ?? 'Unknown error. Ensure sample is valid or try again'}`
                  "
                  icon="pi pi-info-circle"
                  severity="warning"
                >
                  <div class="flex flex-column">
                    <span>unable to assign</span>
                    <a
                      href="mailto:gps@pneumogen.net"
                      class="text-blue-500 font-normal no-underline hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      >contact support</a
                    >
                  </div>
                </Tag>
                <Tag
                  v-else-if="hasSampleFailed(projectStore.project.status?.assign, data.cluster)"
                  v-tooltip.top="
                    `${data.failReasons?.join(', ') ?? 'Unknown error. Ensure sample is valid or try again'}`
                  "
                  value="failed"
                  icon="pi pi-info-circle"
                  severity="danger"
                />

                <Tag v-else value="pending" severity="warning" />
              </template>
            </Column>
            <Column v-if="speciesStore.canAssignSublineages(projectStore.project.species)">
              <template #header>
                <div class="flex flex-column gap-1">
                  <span>Sublineage</span>
                  <small class="text-xs text-color-secondary font-medium">Rank 5 • 10 • 25 • 50</small>
                </div>
              </template>
              <template #body="{ data }">
                <div
                  v-if="
                    data.sublineage && hasSamplePassed(projectStore.project.status?.sublineage_assign, data.cluster)
                  "
                >
                  {{ data.sublineage.Rank_5_Lineage }} • {{ data.sublineage.Rank_10_Lineage }} •
                  {{ data.sublineage.Rank_25_Lineage }} •
                  {{ data.sublineage.Rank_50_Lineage }}
                </div>
                <div v-else-if="!data.hasRun">
                  <em v-if="!data.cluster">not run</em>
                </div>
                <Tag
                  v-else-if="hasSampleFailed(projectStore.project.status?.sublineage_assign, data.cluster)"
                  value="failed"
                  severity="danger"
                />
                <div v-else-if="isSublineageUnavailable(projectStore.project.status, data.sublineage)">
                  <Tag value="unavailable" severity="secondary" icon="pi pi-minus-circle" />
                </div>
                <Tag v-else :value="projectStore.project.status?.sublineage_assign" severity="warning" />
              </template>
            </Column>
            <Column header="Network">
              <template #body="{ data }">
                <Button
                  v-if="
                    !data.hasRun ||
                    hasVisualiseClusterPassed(projectStore.project.status?.visualiseClusters, data.cluster)
                  "
                  outlined
                  icon="pi pi-download"
                  @click="data.cluster && projectStore.downloadZip(AnalysisType.NETWORK, data.cluster)"
                  :disabled="!data.cluster"
                  aria-label="Download network zip"
                  v-tooltip.top="'Download zip'"
                />
                <Tag
                  v-else-if="hasVisualiseClusterFailed(projectStore.project.status, data.cluster)"
                  value="failed"
                  severity="danger"
                />
                <Tag
                  v-else
                  :value="getVisualiseClusterStatus(projectStore.project.status, data.cluster)"
                  severity="warning"
                />
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
                      :disabled="!isAnyVisualiseFinished(projectStore.project.status?.visualiseClusters)"
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
      <TabPanel header="Network" :disabled="!shouldRenderNetwork">
        <NetworkTab v-if="shouldRenderNetwork && hasVisitedNetworkTab" />
      </TabPanel>
    </TabView>
  </ProjectFileUpload>
</template>
