<template>
  <div v-if="savedProjects.length" class="ms-2">
      <h4 class="mt-5">Load a previously saved project</h4>
      <div class="container">
          <div class="row fw-bold">
            <div class="col-6">Project name</div>
          </div>
          <hr/>
          <div v-for="project in savedProjects" :key="project.hash" class="row">
              <div class="col-6">
                  <span class="clickable brand-text">{{ project.name }}</span>
              </div>
          </div>
      </div>
  </div>
</template>

<script>

import { mapActions, mapState } from "vuex";

export default {
    name: "SavedProjects",
    methods: {
        ...mapActions(["getSavedProjects"])
    },
    computed: {
        ...mapState(["savedProjects"])
    },
    mounted() {
        this.getSavedProjects();
    }
};
</script>
