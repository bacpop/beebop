<script setup lang="ts">
import MicroReactColumn from "@/components/ProjectView/MicroReactColumn.vue";
import ProjectDataTable from "@/components/ProjectView/ProjectDataTable.vue";
import { useProjectStore } from "@/stores/projectStore";
import { AnalysisType } from "@/types/projectTypes";
import NetworkTab from "./NetworkTab.vue";
import { ref } from "vue";

const store = useProjectStore();
const hasVisitedNetworkTab = ref(false);

const tabChange = (num: number) => {
  if (num == 1 && !hasVisitedNetworkTab.value) {
    hasVisitedNetworkTab.value = true;
  }
};
</script>

<template>
  <div v-if="store.analysisProgressPercentage !== 100">
    <div class="mb-2 fadein animation-duration-2000 animation-iteration-infinite">Running Analysis...</div>
    <ProgressBar :value="store.analysisProgressPercentage"></ProgressBar>
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
                v-if="store.project.status?.network === 'finished'"
                outlined
                icon="pi pi-download"
                @click="data.cluster && store.downloadZip(AnalysisType.NETWORK, data.cluster)"
                :disabled="!data.cluster"
                aria-label="Download network zip"
                v-tooltip.top="'Download zip'"
              />
              <Tag v-else-if="store.project.status?.network === 'failed'" value="failed" severity="danger" />
              <Tag v-else :value="store.project.status?.network" severity="warning" />
            </template>
          </Column>
          <Column header="Microreact">
            <template #body="{ data }">
              <MicroReactColumn :data="data" />
            </template>
          </Column>
        </template>
      </ProjectDataTable>
    </TabPanel>
    <TabPanel header="Network" :disabled="store.project.status?.network !== 'finished'">
      <NetworkTab v-if="store.project.status?.network === 'finished' && hasVisitedNetworkTab" />
    </TabPanel>
  </TabView>
</template>
