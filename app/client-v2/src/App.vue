<script setup lang="ts">
import AppNav from "@/layouts/AppNav.vue";
import { useTheme } from "@/composables/useTheme";
import { useArgumentsStore } from "./stores/argumentsStore";

const { setInitialTheme } = useTheme();
const { setSketchKmerArguments } = useArgumentsStore();
setInitialTheme();
setSketchKmerArguments();
</script>

<template>
  <AppNav />

  <main class="layout-main-container">
    <RouterView />
  </main>
</template>

<style scoped>
.layout-main-container {
  display: flex;
  max-width: 1536px;
  margin: 0 auto;
  padding: 5rem 2rem 2rem 2rem;
  min-height: 100vh;
}
</style>
