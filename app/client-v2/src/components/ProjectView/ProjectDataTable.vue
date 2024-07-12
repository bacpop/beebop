<script setup lang="ts">
import { useProjectStore } from "@/stores/projectStore";
import AmrColumn from "./AmrColumn.vue";
const store = useProjectStore();
</script>

<template>
  <DataTable :value="store.project.samples" tableStyle="min-width: 50rem" paginator :rows="50">
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
    <Column>
      <template #body="props">
        <Button
          icon="pi pi-times"
          @click="store.removeUploadedFile(props.index)"
          outlined
          rounded
          size="small"
          severity="danger"
          :aria-label="`Remove ${props.data.filename}`"
          :disabled="!store.isReadyToRun || store.isRunning"
        />
      </template>
    </Column>
  </DataTable>
</template>
