<template>
    <div class="text-danger message">
        {{ message }}
    </div>
</template>
<script setup lang="ts">
import { computed, PropType, defineProps } from "vue";
import { ProjectNameCheckResult } from "@/types";

const props = defineProps({
    checkResult: Number as PropType<ProjectNameCheckResult>
});

const message = computed(() => {
    switch (props.checkResult) {
    case ProjectNameCheckResult.Duplicate:
        return "Name already exists";
    case ProjectNameCheckResult.Empty:
        return "Name cannot be empty";
    default:
        return "";
    }
});
</script>
<style scoped>
.message {
    height: 1em;
    font-size: small;
    margin-bottom: 0.7em;
}
</style>
