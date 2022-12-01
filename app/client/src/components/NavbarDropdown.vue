<template>
    <nav class="dropdown">
        <div
        id="navbarDropdown"
        role="button"
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false">
        <i class="bi bi-three-dots-vertical huge menu"></i>
        </div>
        <div class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
          <a class="dropdown-item menu-item" href="#">
            <router-link to="/">Home</router-link>
          </a>
          <a v-if="user" class="dropdown-item menu-item" href="#">
            <router-link to="/project">Project</router-link>
          </a>
          <a class="dropdown-item menu-item" href="#">
            <router-link to="/about">About</router-link>
          </a>
          <div v-if="user" class="dropdown-divider"></div>
          <a v-if="user" class="dropdown-item menu-item" :href="generateLogout">Logout</a>
        </div>
    </nav>
</template>

<script lang="ts">
import { mapState } from 'vuex';
import config from '@settings/config';

export default {
  name: 'NavbarDropdown',
  computed: {
    generateLogout() {
      return `${config.serverUrl()}/logout`;
    },
    ...mapState(['user']),
  },
};
</script>

<style>
@import 'bootstrap-icons/font/bootstrap-icons.css';
</style>
