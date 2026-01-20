<script setup lang="ts">
import MetadataMap from "@/components/MetadataView/MetadataMap.vue";
import { useSpeciesStore } from "@/stores/speciesStore";
import { ref } from "vue";

const speciesStore = useSpeciesStore();
const selectedSpecies = ref();
</script>

<template>
  <div class="flex flex-column">
    <div>
      <h2 class="text-2xl font-bold mb-2">Geographical Distribution of Samples</h2>
      <div class="flex mb-2 align-items-start justify-content-between gap-5">
        <span class="text-base text-color-secondary">
          This map visualizes the geographical distribution of samples from a given species. Each marker represents a
          location where samples were collected, with a tooltip displaying the sample count and country for that
          location.
        </span>

        <Dropdown
          v-model="selectedSpecies"
          :options="speciesStore.speciesWithLocationMetadata"
          placeholder="Select a species"
          class="w-22rem"
          aria-label="Select species to view location metadata"
        />
      </div>
    </div>
    <Suspense v-if="selectedSpecies">
      <MetadataMap :species="selectedSpecies" />

      <template #fallback>
        <div class="flex align-items-center">
          <ProgressSpinner strokeWidth="8" class="w-8rem h-8rem" animationDuration=".5s" />
        </div>
      </template>
    </Suspense>

    <div v-else class="mt-2 p-6 text-center surface-border border-top-1">
      <span class="text-color-secondary">Please select a species to view location metadata.</span>
    </div>
  </div>
</template>
