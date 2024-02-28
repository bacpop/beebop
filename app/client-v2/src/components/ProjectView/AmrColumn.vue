<script setup lang="ts">
import type { AMR } from "@/types/projectTypes";
import { computed } from "vue";

const props = defineProps<{
  amr?: AMR;
}>();
console.log(props.amr);

const tagSeverity = (percent: number) => {
  if (percent < 33) return "danger";
  if (percent < 66) return "warning";
  if (percent > 66) return "success";
  return "secondary";
};
const getPercent = (value: number) => Math.round(value * 100);

const displayAMR = computed(() => {
  if (!props.amr) return;
  return {
    Penicillin: {
      label: "P",
      value: getPercent(props.amr.Penicillin),
      severity: tagSeverity(getPercent(props.amr.Penicillin))
    },

    Chloramphenicol: {
      label: "C",
      value: getPercent(props.amr.Chloramphenicol),
      severity: tagSeverity(getPercent(props.amr.Chloramphenicol))
    },
    Erythromycin: {
      label: "E",
      value: getPercent(props.amr.Erythromycin),
      severity: tagSeverity(getPercent(props.amr.Erythromycin))
    },
    Tetracycline: {
      label: "Te",
      value: getPercent(props.amr.Tetracycline),
      severity: tagSeverity(getPercent(props.amr.Tetracycline))
    },
    Cotrim: {
      label: "Sxt",
      value: getPercent(props.amr.Trim_sulfa),
      severity: tagSeverity(getPercent(props.amr.Trim_sulfa))
    }
  };
});
</script>

<template>
  <div v-if="amr" class="flex gap-2 flex-wrap">
    <Tag v-tooltip.top="key" :severity="value.severity" v-for="(value, key) in displayAMR" :key="key">
      <div class="flex align-items-center gap-2 px-1">
        <span class="text-base">{{ value.label }}</span>
        <span style="width: 26px">{{ value.value }}%</span>
      </div>
    </Tag>
  </div>
  <Tag v-else value="pending" severity="warning" />
</template>
