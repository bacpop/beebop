<template v-if="savedProjects.length">
  <h3>Load a previously saved project</h3>
</template>

<script>
export default {
    name: "SavedProjects",
    methods: {
        ...mapActions(["getSavedProjects"])
    },
    computed: {
        ...mapState(["savedProjects"])
    },
    mounted() {
        getSavedProjects();
    }
}
</script>

