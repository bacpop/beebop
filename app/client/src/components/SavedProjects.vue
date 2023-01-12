<template v-if="savedProjects.length">
  <h3>Load a previously saved project</h3>
  <div class="container">
      <div class="row">
        <div class="col-6">ProjectName</div>
      </div>
      <div v-for="project in savedProjects" :key="project.hash" class="row">
          <div class="col-6">{{ project.name }}</div>
      </div>
  </div>
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

