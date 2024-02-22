<script setup lang="ts">
import { useProjectStore } from "@/stores/projectStore";

const store = useProjectStore();
</script>

<template>
  <DataTable :value="store.fileSamples" tableStyle="min-width: 50rem">
    <template #header>
      <slot name="table-header" />
    </template>
    <Column field="filename" header="File Name"></Column>
    <Column field="sketch" header="Sketch">
      <template #body="props">
        <Tag v-if="props.data.sketch" value="done" severity="success" />
        <Tag v-else value="pending" severity="warning" />
      </template>
    </Column>
    <!-- TODO: AMR display   -->
    <Column field="amr" header="AMR">
      <template #body="props">
        <Tag v-if="props.data.amr" value="done" severity="success" />
        <Tag v-else value="pending" severity="warning" />
      </template>
    </Column>
    <slot name="extra-cols" />
  </DataTable>
</template>
