<script setup lang="ts">
import ExternalLink from "@/components/Common/ExternalLink.vue";
</script>

<template>
  <div
    class="flex flex-column justify-content-between p-5 mb-3 border-round surface-card shadow-2"
    style="max-width: 900px"
  >
    <div>
      <h1 class="text-2xl font-semibold">About</h1>
      <p class="text-lg">
        BeeBOP is being developed by the RESIDE group within MRC GIDA as an online interface to the PopPUNK method
        developed by John Lees (<ExternalLink href="https://www.ebi.ac.uk" display-text="EMBL-EBI" />) and Nick Croucher
        (<ExternalLink href="https://www.imperial.ac.uk/" display-text="Imperial College London" />).<br />
        This work is part of the Global Pneumococcal Sequencing project, led by Stephen Bentley (
        <ExternalLink href="https://www.sanger.ac.uk/" display-text="Wellcome Sanger Institute" />
        ) and Lesley McGee (<ExternalLink href="https://www.cdc.gov/" display-text="CDC" />), managed by Stephanie Lo
        (Wellcome Sanger Institute), and funded by the
        <ExternalLink href="https://www.gatesfoundation.org/" display-text="Bill & Melinda Gates Foundation" />
        and
        <ExternalLink href="https://wellcome.org/" display-text="Wellcome" />.
      </p>
    </div>
    <div class="flex gap-4 flex-wrap">
      <img src="@/assets/cdc.webp" alt="cdc logo" class="mb-5 w-7rem flex-shrink-0" />
      <img src="@/assets/sanger.webp" alt="sanger logo" class="mb-5 w-12rem flex-shrink-0" />
      <img src="@/assets/gates.webp" alt="gates logo" class="mb-5 w-14rem flex-shrink-0" />
      <img src="@/assets/embl.webp" alt="embl logo" class="mb-5 w-12rem flex-shrink-0" />
      <img src="@/assets/imperial.webp" alt="imperial logo" class="mb-5 w-14rem flex-shrink-0" />
      <img src="@/assets/wellcome.webp" alt="wellcome logo" class="mb-5 flex-shrink-0" />
    </div>
  </div>
</template>
