<script setup lang="ts">
import MetadataMap from "@/components/MetadataView/MetadataMap.vue";
import { useSpeciesStore } from "@/stores/speciesStore";
import { computed, ref } from "vue";

const speciesStore = useSpeciesStore();
const selectedSpecies = ref();
const locationMetadata = computed(() => speciesStore.getLocationMetadata(selectedSpecies.value));
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
          :options="speciesStore.species"
          placeholder="Select a species"
          class="w-22rem"
          aria-label="Select species to view location metadata"
        />
      </div>
    </div>
    <MetadataMap v-if="locationMetadata" :locationMetadata="locationMetadata" />

    <div v-else class="mt-2 p-6 text-center surface-border border-top-1">
      <span v-if="!selectedSpecies" class="text-color-secondary"
        >Please select a species to view location metadata.</span
      >
      <span v-else class="text-yellow-600">No location metadata available for the selected species.</span>
    </div>
  </div>
</template>
