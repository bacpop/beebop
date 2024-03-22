<script setup lang="ts"></script>

<template>
  <div
    class="flex flex-column justify-content-between p-5 mb-3 border-round surface-card shadow-2"
    style="max-width: 900px"
  >
    <div>
      <h1 class="text-2xl font-semibold">About</h1>
      <p class="text-lg">
        BeeBOP is being developed by the RESIDE group within MRC GIDA as an online interface to the PopPUNK method
        developed by John Lees (<a
          href="https://www.ebi.ac.uk/"
          target="_blank"
          rel="noopener noreferrer"
          class="no-underline text-primary hover:underline"
          >EMBL-EBI</a
        >) and Nick Croucher (<a
          href="https://www.imperial.ac.uk/"
          target="_blank"
          rel="noopener noreferrer"
          class="no-underline text-primary hover:underline"
          >Imperial College London</a
        >).<br />
        This work is part of the Global Pneumococcal Sequencing project, led by Stephen Bentley (<a
          href="https://www.sanger.ac.uk/"
          target="_blank"
          rel="noopener noreferrer"
          class="no-underline text-primary hover:underline"
          >Wellcome Sanger Institute</a
        >) and Lesley McGee (<a
          href="https://www.cdc.gov/"
          target="_blank"
          rel="noopener noreferrer"
          class="no-underline text-primary hover:underline"
          >CDC</a
        >), managed by Stephanie Lo (Wellcome Sanger Institute), and funded by the
        <a
          href="https://www.gatesfoundation.org/"
          target="_blank"
          rel="noopener noreferrer"
          class="no-underline text-primary hover:underline"
          >Bill & Melinda Gates Foundation and Wellcome.</a
        >
      </p>
    </div>
    <div class="flex gap-4 flex-wrap">
      <img src="@/assets/cdc.webp" alt="cdc logo" class="mb-5 w-7rem flex-shrink-0" />
      <img src="@/assets/sanger.webp" alt="sanger logo" class="mb-5 w-12rem flex-shrink-0" />
      <img src="@/assets/gates.webp" alt="gates logo" class="mb-5 w-14rem flex-shrink-0" />
      <img src="@/assets/embl.webp" alt="embl logo" class="mb-5 w-12rem flex-shrink-0" />
      <img src="@/assets/imperial.webp" alt="imperial logo" class="mb-5 w-14rem flex-shrink-0" />
    </div>
  </div>
</template>
