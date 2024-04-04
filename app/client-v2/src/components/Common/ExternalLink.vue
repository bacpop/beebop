<script setup lang="ts">
defineProps<{
  href: string;
  displayText: string;
}>();
</script>

<template>
  <a :href="href" target="_blank" rel="noopener noreferrer" class="no-underline text-primary hover:underline">{{
    displayText
  }}</a>
</template>
