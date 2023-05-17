<template>
    <loading-spinner class="spinner"></loading-spinner>
    <div>Loading project...</div>
    <div v-for="message in loadingProjectMessages" class="loading-project-message">
        {{ message }}
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import {mapState} from "vuex";

export default defineComponent({
    name: "LoadingProject",
    components: {
        LoadingSpinner
    },
    computed: {
        ...mapState(["loadingProjectMessages"])
    }
});

</script>

<style scoped>
 .spinner {
     margin: auto;
 }
</style>
