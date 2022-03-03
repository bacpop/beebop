<template>
  <div>
    <p>
      Version info:
    </p>
    <p v-for="component in versioninfo" :key="component.name">{{component.name}}
        {{component.version}}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

const API_URL = 'http://localhost:4000';

export default defineComponent({
  name: 'VersionInfo',
  data() {
    return {
      versioninfo: [],
    };
  },
  mounted() {
    this.getVersions();
  },
  methods: {
    async getVersions() {
      try {
        const response = await fetch(`${API_URL}/version`);
        const data = await response.json();
        this.versioninfo = data.data;
      } catch (error) {
        console.error(error);
      }
    },
  },
});
</script>
