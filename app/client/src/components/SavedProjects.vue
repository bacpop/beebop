<template>
  <div v-if="savedProjects.length" class="ms-2">
      <h4 class="mt-5">Load a previously saved project</h4>
      <div class="container">
          <div class="row fw-bold saved-project-headers">
            <div class="col-6">Project name</div>
          </div>
          <hr/>
          <div v-for="project in savedProjects" :key="project.hash" class="row saved-project-row">
              <div class="col-6">
                  <span class="clickable brand-text" @click="loadProject(project)" @keydown="loadKB">
                      {{ project.name }}
                  </span>
              </div>
          </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import {computed, onMounted} from "vue";
import {useStore} from "vuex";
import {SavedProject} from "@/types";

const store = useStore();
const router = useRouter();

const savedProjects = computed(() => store.state.savedProjects);
function loadProject(project: SavedProject) {
    store.dispatch("loadProject", project);
    router.push("/project");
}

function loadKB() {
    console.log("TODO");
}

onMounted(() => {
    store.dispatch("getSavedProjects");
});

</script>
