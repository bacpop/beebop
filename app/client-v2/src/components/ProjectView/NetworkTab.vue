<script setup lang="ts">
import { getApiUrl } from "@/config";
import { useProjectStore } from "@/stores/projectStore";
import type { ApiResponse } from "@/types/projectTypes";
import { useFetch } from "@vueuse/core";
import NetworkGraphs from "./NetworkGraphs.vue";

const apiUrl = getApiUrl();
const store = useProjectStore();
const { data, error, isFetching } = useFetch(`${apiUrl}/networkGraphs/${store.project.hash}`, {
  credentials: "include"
}).json<ApiResponse<Record<string, string>>>();
</script>

<template>
  <div v-if="error" class="text-red-500 text-center font-semibold">
    Error fetching network graphs... Refresh or try again later
  </div>
  <div v-else-if="isFetching" class="text-center">
    <ProgressSpinner strokeWidth="8" class="w-4rem h-4rem" animationDuration=".5s" />
  </div>
  <div v-else-if="data?.data">
    <NetworkGraphs :networkGraphs="data.data" />
  </div>
</template>
