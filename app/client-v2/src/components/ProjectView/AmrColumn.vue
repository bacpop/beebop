<script setup lang="ts">
import type { AMR } from "@/types/projectTypes";
import { convertToRoundedPercent } from "@/utils/math";
import { computed } from "vue";

const props = defineProps<{
  amr?: AMR;
}>();

const tagSeverity = (percent: number) => {
  if (percent < 33) return "success";
  if (percent < 66) return "warning";
  if (percent > 66) return "danger";
  return "secondary";
};

const getDisplayAMR = (label: string, decimalValue: number) => ({
  label,
  value: convertToRoundedPercent(decimalValue),
  severity: tagSeverity(convertToRoundedPercent(decimalValue))
});

const displayAMR = computed(() => {
  if (!props.amr) return;
  return {
    Penicillin: getDisplayAMR("P", props.amr.Penicillin),
    Chloramphenicol: getDisplayAMR("C", props.amr.Chloramphenicol),
    Erythromycin: getDisplayAMR("E", props.amr.Erythromycin),
    Tetracycline: getDisplayAMR("Te", props.amr.Tetracycline),
    Cotrim: getDisplayAMR("Sxt", props.amr.Trim_sulfa)
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
