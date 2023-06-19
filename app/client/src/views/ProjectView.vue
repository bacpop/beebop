<template>
  <div>
    <div v-if="projectId && !loadingProject" class="project">
      <div class="file-input">
        <DropZone v-if="user && !submitStatus" class="dropzone-component"/>
      </div>
      <div class="overview">
        <h2 class="left">Project: {{projectName}}</h2>
        <StartButton v-if="user" />
        <ProgressBar v-if="submitStatus" class="progress-bar-component" />

        <div v-if="submitStatus" class="tabs tabs-horizontal">
          <div class ="nav-row">
            <ul class="nav nav-tabs-row">
              <li class="nav-item">
                <button class="nav-link no-transition"
                :class="'table' == selectedTab ? 'active' : ''"
                :aria-selected="'table' == selectedTab"
                @click="onInput('table')">Table</button>
              </li>
              <li class="nav-item">
                <button class="nav-link no-transition"
                :class="(analysisStatus.network == 'finished' ?
                'network' == selectedTab ? 'active' :'' :
                'disabled')"
                :aria-selected="'network' == selectedTab"
                @click="onInput('network')">Network</button>
              </li>
              <li class="fill-container-row"> </li>
            </ul>
          </div>
        </div>

        <div class="tab-content tab-content-row"
        :class="submitStatus ? 'no-top-border' : '' ">
          <div
          class="tab-pane fade m-3"
          :class="'table' == selectedTab ? 'active show' : ''">
            <ResultsTable />
          </div>
          <div
          class="tab-pane fade m-3"
          :class="'network' == selectedTab ? 'active show' : ''">
            <NetworkVisualisations
            v-if="user && analysisStatus.network === 'finished' && 'network' == selectedTab"
            :firstCluster="uniqueClusters[0]"
            />
          </div>
        </div>
      </div>
    </div>
    <div v-else id="loading-project">
        <loading-project></loading-project>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from "vue";
import { mapState, mapActions, mapGetters } from "vuex";
import DropZone from "@/components/DropZone.vue";
import StartButton from "@/components/StartButton.vue";
import ProgressBar from "@/components/ProgressBar.vue";
import ResultsTable from "@/components/ResultsTable.vue";
import LoadingProject from "@/components/LoadingProject.vue";
import NetworkVisualisations from "@/components/NetworkVisualisations.vue";

export default defineComponent({
    name: "ProjectView",
    components: {
        DropZone,
        StartButton,
        ProgressBar,
        ResultsTable,
        NetworkVisualisations,
        LoadingProject
    },
    data() {
        return {
            selectedTab: "table"
        };
    },
    mounted() {
    // redirect to home page if no project name
        if (!this.projectName) {
            this.$router.push("/");
        } else {
            this.getUser();
        }
    },
    beforeUnmount() {
        this.stopStatusPolling();
    },
    methods: {
        ...mapActions(["getUser", "stopStatusPolling"]),
        onInput(value: string) {
            this.selectedTab = value;
        }
    },
    computed: {
        ...mapState(["user", "submitStatus", "analysisStatus", "projectId", "projectName", "loadingProject"]),
        ...mapGetters(["uniqueClusters"])
    }
});
</script>
