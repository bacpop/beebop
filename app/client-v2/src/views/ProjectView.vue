<script setup lang="ts">
import Project from "@/components/ProjectView/ProjectPage.vue";
</script>

<template>
  <Suspense>
    <Project />

    <template #fallback>
      <div class="flex align-items-center">
        <ProgressSpinner strokeWidth="8" class="w-8rem h-8rem" animationDuration=".5s" /> />
      </div>
    </template>
  </Suspense>
</template>
