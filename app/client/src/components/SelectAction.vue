<template>
  <div class="mt-3 container left">
    <div class="row">
      <div class="col-6">
        <input id="create-project-name"
               placeholder="Project name"
               type="text"
               v-model="projectName"
               aria-label="Project name"
               class="form-control input-text"
               @keyup.enter="runAnalysis">
      </div>
      <div class="col-6">
        <button
        id="create-project-btn"
        class="btn btn-standard"
        :disabled="!projectName"
        @click="runAnalysis">Create new project</button>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { mapActions, mapMutations } from 'vuex';

export default defineComponent({
  name: 'SelectAction',
  data() {
    return {
      projectName: '',
    };
  },
  mounted() {
    this.getUser();
  },
  methods: {
    ...mapActions(['getUser']),
    ...mapMutations(['setProjectName']),
    runAnalysis() {
      if (this.projectName) {
        this.setProjectName(this.projectName);
        this.$router.push('/project');
      }
    },
  },
});
</script>
