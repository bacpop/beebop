<template>
  <div v-if="savedProjects.length" class="ms-2">
      <h4 class="mt-5">Load a previously saved project</h4>
      <div class="container">
          <div class="row fw-bold saved-project-headers">
            <div class="col-6">Project name</div>
            <div class="col-6">Date</div>
          </div>
          <hr/>
          <div v-for="project in savedProjects" :key="project.hash" class="row saved-project-row">
              <div class="col-6">
                  <button class="clickable brand-text"
                          @click="loadProject(project)"
                          @keydown="loadProjectFromKey(project, $event.keyCode)">
                      {{ project.name }}
                  </button>
              </div>
              <div class="col-6">
                  {{ project.timestamp }}
              </div>
          </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { computed, onMounted } from "vue";
import { useStore } from "vuex";
import { SavedProject } from "@/types";

const store = useStore();
const router = useRouter();

const savedProjects = computed(() => store.state.savedProjects);
function loadProject(project: SavedProject) {
    store.dispatch("loadProject", project);
    router.push("/project");
}

function loadProjectFromKey(project: SavedProject, keyCode: number) {
    // load on Enter
    if (keyCode === 13) {
        loadProject(project);
    }
}

onMounted(() => {
    store.dispatch("getSavedProjects");
});

</script>
