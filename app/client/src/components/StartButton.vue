<template>
  <div class="start-analysis">
    <button :class="(!submitted && allSketched) ? '' : 'disabled'"
    class="btn btn-block btn-standard"
    @click='onClick'>
      Start Analysis</button>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from "vue";
import { mapActions, mapState } from "vuex";

export default defineComponent({
    name: "StartButton",
    methods: {
        ...mapActions(["submitData"]),
        onClick() {
            this.submitData();
        }
    },
    computed: {
        ...mapState(["submitted", "analysisStatus", "results"]),
        allSketched(): boolean {
            const isolates = this.results.perIsolate;
            const keys = Object.keys(isolates);
            return !!keys.length && keys.every((el: string) => isolates[el].sketch);
        }
    }
});
</script>
