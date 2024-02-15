<script setup lang="ts">
import AppNav from "@/layouts/AppNav.vue";
import { useTheme } from "@/composables/useTheme";

const { setInitialTheme } = useTheme();
setInitialTheme();
</script>

<template>
  <AppNav />

  <main class="layout-main-container">
    <RouterView />
  </main>
</template>

<style scoped>
.layout-main-container {
  /* display: flex;
  flex-direction: column;
  min-height: 100vh;
  justify-content: space-between; */
  padding: 5rem 2rem 2rem 2rem;
}
</style>
