<template>
  <div>
    <p>Nice to see you, {{user.name}}!</p>
    <a :href="generateLogout" class="btn btn-block btn-standard">Logout</a>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'vuex';
import config from '@settings/config';

export default defineComponent({
  name: 'GreetingAndLogout',
  mounted() {
    this.getUser();
  },
  methods: {
    ...mapActions(['getUser']),
  },
  computed: {
    generateLogout() {
      return `${config.serverUrl()}/logout`;
    },
    ...mapState(['user']),
  },
});
</script>
