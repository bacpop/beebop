<script setup lang="ts">
import MicroReactColumn from "@/components/ProjectView/MicroReactColumn.vue";
import ProjectDataTable from "@/components/ProjectView/ProjectDataTable.vue";
import { useProjectStore } from "@/stores/projectStore";
import { AnalysisType } from "@/types/projectTypes";

const store = useProjectStore();
</script>

<template>
  <ProjectDataTable>
    <template #table-header>
      <div v-if="store.analysisProgressPercentage !== 100">
        <div class="mb-2 fadein animation-duration-1000 animation-iteration-infinite">Running Analysis...</div>
        <ProgressBar :value="store.analysisProgressPercentage"></ProgressBar>
      </div>
      <!-- TODO: update with network tab too -->
      <div v-else class="h-1rem"></div>
    </template>
    <template #extra-cols>
      <Column field="cluster" header="Cluster">
        <template #body="{ data }">
          <span v-if="data.cluster"> {{ data.cluster }}</span>
          <Tag v-else value="pending" severity="warning" /> </template
      ></Column>
      <Column header="Network">
        <template #body="{ data }">
          <Button
            v-if="store.analysisStatus.network === 'finished'"
            outlined
            icon="pi pi-download"
            @click="data.cluster && store.downloadZip(AnalysisType.NETWORK, data.cluster)"
            :disabled="!data.cluster || store.hadDownloadedZip.network"
          />
          <Tag v-else-if="store.analysisStatus.network === 'failed'" value="failed" severity="danger" />
          <Tag v-else :value="store.analysisStatus.network" severity="warning" />
        </template>
      </Column>
      <Column header="Microreact">
        <template #body="{ data }">
          <MicroReactColumn :data="data" />
        </template>
      </Column>
    </template>
  </ProjectDataTable>
</template>
