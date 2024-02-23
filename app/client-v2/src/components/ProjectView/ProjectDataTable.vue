<script setup lang="ts">
import { useProjectStore } from "@/stores/projectStore";
import AmrColumn from "./AmrColumn.vue";
const store = useProjectStore();
</script>

<template>
  <DataTable :value="store.fileSamples" tableStyle="min-width: 50rem">
    <template #header>
      <slot name="table-header" />
    </template>
    <Column field="filename" header="File Name"></Column>
    <Column field="sketch" header="Sketch">
      <template #body="{ data }">
        <Tag v-if="data.sketch" value="done" severity="success" />
        <Tag v-else value="pending" severity="warning" />
      </template>
    </Column>
    <Column field="amr" header="Antimicrobial resistance">
      <template #body="{ data }">
        <AmrColumn :amr="data.amr" />
      </template>
    </Column>
    <slot name="extra-cols" />
  </DataTable>
</template>
