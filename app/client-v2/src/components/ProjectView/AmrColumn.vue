<script setup lang="ts">
import type { AMR } from "@/types/projectTypes";
import { computed } from "vue";

const props = defineProps<{
  amr?: AMR;
}>();
const displayAMR = computed(() => {
  if (!props.amr) return;
  return {
    Penicillin: {
      label: "P",
      value: getPercent(props.amr.Penicillin)
    },

    Chloramphenicol: {
      label: "C",
      value: getPercent(props.amr.Chloramphenicol)
    },
    Erythromycin: {
      label: "E",
      value: getPercent(props.amr.Erythromycin)
    },
    Tetracycline: {
      label: "Te",
      value: getPercent(props.amr.Tetracycline)
    },
    Cotrim: {
      label: "Sxt",
      value: getPercent(props.amr.Trim_sulfa)
    }
  };
});
const getPercent = (value: number) => Math.round(value * 100);
</script>

<template>
  <div v-if="amr" class="flex gap-2 flex-wrap">
    <div v-for="(value, key) in displayAMR" :key="key">
      <Tag v-tooltip.top="key" severity="secondary">
        <div class="flex align-items-center gap-2 px-1">
          <span class="text-base">{{ value.label }}</span>
          <span>{{ value.value }}%</span>
        </div>
      </Tag>
    </div>
  </div>
  <Tag v-else value="pending" severity="warning" />
</template>
