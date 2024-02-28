<script setup lang="ts">
import { useProjectStore } from "@/stores/projectStore";
import { useRoute } from "vue-router";
import RunProject from "@/components/ProjectView/RunProject.vue";
import NotRunProject from "@/components/ProjectView/NotRunProject.vue";

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
      <div class="flex align-items-center">
        <span class="text-3xl font-bold mr-2">{{ store.basicInfo.name }}</span>
        <Tag
          v-if="store.isProjectComplete"
          severity="success"
          icon="pi pi-check"
          value="Completed"
          style="font-size: x-small"
        />
      </div>
      <span class="text-color-secondary">Upload genomics data and run analysis on them</span>
    </div>
    <div class="surface-card p-4 shadow-2 border-round">
      <RunProject v-if="store.isRun" />
      <NotRunProject v-else />
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
    width: 1350px;
  }
}
</style>
