<template>
  <div class="about">
    <h2>About</h2>
    <VersionInfo />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VersionInfo from "@/components/VersionInfo.vue";

export default defineComponent({
    name: "AboutView",
    components: {
        VersionInfo
    }
});
</script>
