<script setup lang="ts">
import type { AMR } from "@/types/projectTypes";
import { convertProbabilityToWord, generateRGBForAmr } from "@/utils/amrUtils";
import { computed } from "vue";

const props = defineProps<{
  amr?: AMR;
}>();

const displayAMR = computed(() => {
  if (!props.amr) return;
  return {
    Penicillin: { label: "P", value: props.amr.Penicillin },
    Chloramphenicol: { label: "C", value: props.amr.Chloramphenicol },
    Erythromycin: { label: "E", value: props.amr.Erythromycin },
    Tetracycline: { label: "Te", value: props.amr.Tetracycline },
    Cotrim: { label: "Sxt", value: props.amr.Trim_sulfa }
  };
});
</script>

<template>
  <div v-if="amr" class="flex gap-2 flex-wrap">
    <Tag
      v-tooltip.top="key + ': ' + convertProbabilityToWord(value.value, key)"
      :style="`background-color: ${generateRGBForAmr(value.value, key)}; color: var(--text-color)`"
      v-for="(value, key) in displayAMR"
      :key="key"
    >
      <div class="flex align-items-center gap-2 px-1">
        <span class="text-base">{{ value.label }}</span>
      </div>
    </Tag>
  </div>
  <Tag v-else value="pending" severity="warning" />
</template>
