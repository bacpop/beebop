<template>
  <div>
    <p>
      Version info:
    </p>
    <p v-for="component in versions.data" :key="component.name" class="version-info">
      {{component.name}} {{component.version}}
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'vuex';

export default defineComponent({
  name: 'VersionInfo',
  mounted() {
    this.getVersions();
  },
  methods: {
    ...mapActions([
      'getVersions',
    ]),
  },
  computed: mapState([
    'versions',
  ]),
});
</script>
