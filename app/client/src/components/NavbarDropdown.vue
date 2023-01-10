<template>
    <nav class="dropdown">
        <div
        id="navbarDropdown"
        role="button"
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false">
          <span id="logged-in-user" class="mr-2">{{ loggedInText }}</span>
          <i class="bi bi-three-dots-vertical huge menu icon"></i>
        </div>
        <div class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
          <router-link class="dropdown-item menu-item"  to="/">
            Home
          </router-link>
          <router-link v-if="user" class="dropdown-item menu-item" to="/project">
            Project
          </router-link>
          <router-link class="dropdown-item menu-item" to="/about">
            About
          </router-link>
          <div v-if="user" class="dropdown-divider"></div>
          <a v-if="user" id="logout-link" class="dropdown-item menu-item" :href="generateLogout">
            Logout
          </a>
        </div>
    </nav>
</template>

<script lang="ts">
import { mapState } from "vuex";
import config from "@settings/config";
import { RouterLink } from "vue-router";

export default {
    name: "NavbarDropdown",
    components: {
        RouterLink
    },
    computed: {
        generateLogout() {
            return `${config.serverUrl()}/logout`;
        },
        ...mapState(["user"]),
        loggedInText() {
            return this.user ? `Logged in as ${this.user.name}` : "";
        }
    }
};
</script>

<style>
@import 'bootstrap-icons/font/bootstrap-icons.css';
</style>
