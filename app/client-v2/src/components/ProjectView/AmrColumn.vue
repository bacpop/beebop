<script setup lang="ts">
import type { AMR } from "@/types/projectTypes";
import { convertProbabilityToWord, getProbabilityColor } from "@/utils/amrDisplayUtils";
import { convertToRoundedPercent } from "@/utils/math";
import { computed } from "vue";

const props = defineProps<{
  amr?: AMR;
}>();

const displayAMR = computed(() => {
  if (!props.amr) return;
  return {
    Penicillin: {
      label: "P",
      value: props.amr.Penicillin,
      probabilityWord: convertProbabilityToWord(props.amr.Penicillin, "Penicillin")
    },
    Chloramphenicol: {
      label: "C",
      value: props.amr.Chloramphenicol,
      probabilityWord: convertProbabilityToWord(props.amr.Chloramphenicol, "Chloramphenicol")
    },
    Erythromycin: {
      label: "E",
      value: props.amr.Erythromycin,
      probabilityWord: convertProbabilityToWord(props.amr.Erythromycin, "Erythromycin")
    },
    Tetracycline: {
      label: "Te",
      value: props.amr.Tetracycline,
      probabilityWord: convertProbabilityToWord(props.amr.Tetracycline, "Tetracycline")
    },
    Cotrim: {
      label: "Sxt",
      value: props.amr.Trim_sulfa,
      probabilityWord: convertProbabilityToWord(props.amr.Trim_sulfa, "Cotrim")
    }
  };
});
</script>

<template>
  <div v-if="amr" class="flex gap-2 flex-wrap">
    <Tag
      v-tooltip.top="`${key}: ${isNaN(value) ? 'Unknown' : `${probabilityWord}(${convertToRoundedPercent(value)}%)`}`"
      :style="`background-color: ${getProbabilityColor(probabilityWord)}; color: var(--text)`"
      v-for="({ label, value, probabilityWord }, key) in displayAMR"
      :key="key"
    >
      <div class="flex align-items-center gap-2 px-1">
        <span class="text-base">{{ label }}</span>
      </div>
    </Tag>
  </div>
  <Tag v-else value="pending" severity="warning" />
</template>
