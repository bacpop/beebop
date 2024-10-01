<script setup lang="ts">
import { useProjectStore } from "@/stores/projectStore";
import { useRoute } from "vue-router";
import ProjectPostRun from "@/components/ProjectView/ProjectPostRun.vue";
import ProjectPreRun from "@/components/ProjectView/ProjectPreRun.vue";
import { onUnmounted } from "vue";
import Toast from "primevue/toast";

const route = useRoute();
const store = useProjectStore();

const projectFetchError = await store.getProject(route.params.id as string);

onUnmounted(() => {
  store.stopPollingStatus();
});
</script>

<template>
  <Toast />
  <div
    v-if="projectFetchError && (projectFetchError as any).response?.status === 404"
    class="text-red-500 text-center font-semibold flex align-items-center"
  >
    Project not found. This project does not exist or has been deleted.
  </div>
  <div v-else-if="projectFetchError" class="text-red-500 text-center font-semibold flex align-items-center">
    Error fetching project... Refresh or try again later
  </div>
  <div v-else class="single-project-card">
    <div class="flex flex-column gap-1 mb-3">
      <div>
        <span class="text-3xl font-bold mr-2">{{ store.project.name }}</span>
        <InlineMessage severity="info" class="text-xs">{{ store.project.species }}</InlineMessage>
      </div>
      <span class="text-color-secondary"
        >Upload genomics data for {{ store.project.species }} and run analysis on them</span
      >
    </div>
    <div class="surface-card p-4 shadow-2 border-round">
      <ProjectPostRun v-if="store.hasStartedAtLeastOneRun" />
      <ProjectPreRun v-else />
    </div>
  </div>
</template>

<style scoped>
@media (min-width: 1250px) {
  .single-project-card {
    width: 1200px;
  }
}
@media (min-width: 1500px) {
  .single-project-card {
    width: 1400px;
  }
}
</style>
