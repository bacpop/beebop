<script setup lang="ts">
import { ref } from 'vue'
const date = ref(new Date())
</script>

<template>
  <div class="p-5 mb-3 border-round-sm surface-card">
    <Calendar v-model="date" />
    <div>{{ date }}</div>
  </div>
</template>

<style scoped>
.card {
  background: var(--surface-card);
  padding: 2rem;
  border-radius: 10px;
  margin-bottom: 1rem;
}
</style>
