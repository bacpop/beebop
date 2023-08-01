<template>
  <div class="app">
    <div class="header">
      <img src="./resources/beebop_logo_transparent.png" class="logo" alt="beebop logo">
      <NavbarDropdown class=".navbar-dropdown" />
    </div>
    <router-view/>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from "vue";
import { mapActions } from "vuex";
import NavbarDropdown from "@/components/NavbarDropdown.vue";

export default defineComponent({
    components: {
        NavbarDropdown
    },
    mounted() {
        this.getUser();
    },
    methods: {
        ...mapActions(["getUser"])
    }
});
</script>

<style lang="scss">
@import "./scss/imported.scss";
@import "./scss/beebop.scss";

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
