<template>
  <div class="select-action">
    <i class="bi bi-house-fill left house"></i>
    <p class="left">Welcome back, {{user.name}}!</p>
    <button
    class="btn btn-block btn-standard btn-selection"
    @click="runAnalysis">Run new analysis</button>
    <!-- These buttons are just dummies so far -->
    <button class="btn btn-block btn-standard btn-selection disabled">See previous analyses</button>
    <!--<button class="btn btn-block btn-standard btn-selection disabled">Manage my data</button>-->
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'vuex';

export default defineComponent({
  name: 'SelectAction',
  mounted() {
    this.getUser();
  },
  methods: {
    ...mapActions(['getUser']),
    runAnalysis() {
      this.$router.push('/project');
    },
  },
  computed: {
    ...mapState(['user']),
  },
});
</script>

<style>
@import 'bootstrap-icons/font/bootstrap-icons.css';
</style>
