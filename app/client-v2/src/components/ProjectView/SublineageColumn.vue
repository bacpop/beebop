<script setup lang="ts">
import { useProjectStore } from "@/stores/projectStore";
import { type ProjectSample } from "@/types/projectTypes";
import { hasSublineagePassed, hasSublineageFailed, isSublineageUnavailable } from "@/utils/projectStatus";

defineProps<{
  data: ProjectSample;
}>();
const projectStore = useProjectStore();
</script>

<template>
  <div v-if="!data.hasRun">
    <em>not run</em>
  </div>

  <div
    v-else-if="data.sublineage && hasSublineagePassed(projectStore.project.status?.sublineageAssign, data.sublineage)"
  >
    {{ data.sublineage.Rank_50_Lineage }} • {{ data.sublineage.Rank_25_Lineage }} •
    {{ data.sublineage.Rank_10_Lineage }} •
    {{ data.sublineage.Rank_5_Lineage }}
  </div>

  <Tag v-else-if="hasSublineageFailed(projectStore.project.status, data.cluster)" value="failed" severity="danger" />

  <Tag
    v-else-if="isSublineageUnavailable(projectStore.project.status, data.sublineage)"
    value="unavailable"
    severity="secondary"
    icon="pi pi-minus-circle"
    v-tooltip.top="'Cluster too small for sublineage assignment.'"
  />

  <Tag v-else :value="projectStore.project.status?.sublineageAssign" severity="warning" />
</template>
