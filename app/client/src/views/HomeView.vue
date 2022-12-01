<template>
  <div class='home'>
    <h1 v-if='!user'>Welcome to beebop!</h1>
    <div class='auth'>
      <LoginPrompt v-if='!user' />
    </div>
    <SelectAction v-if='user' />
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { mapState, mapActions, mapGetters } from 'vuex';
import LoginPrompt from '@/components/LoginPrompt.vue';
import SelectAction from '@/components/SelectAction.vue';

export default defineComponent({
  name: 'HomeView',
  components: {
    LoginPrompt,
    SelectAction,
  },
  mounted() {
    this.getUser();
  },
  methods: {
    ...mapActions(['getUser']),
  },
  computed: {
    filesUploaded() {
      return Object.keys(this.results.perIsolate).length > 0;
    },
    ...mapState(['user', 'results', 'submitStatus', 'analysisStatus']),
    ...mapGetters([
      'uniqueClusters',
    ]),
  },
});
</script>
