<template>
  <div class=social>
    <ul>
      <li><a :href="generateLoginGoogle" class="btn btn-block btn-social btn-google">
        <i class='fa fa-google'></i> Login with Google</a></li>
      <li><a :href="generateLoginGithub" class="btn btn-block btn-social btn-github">
        <i class='fa fa-github'></i> Login with Github</a></li>
    </ul>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import config from '@settings/config';

export default defineComponent({
  computed: {
    generateLoginGoogle() {
      return `${config.serverUrl()}/login/google`;
    },
    generateLoginGithub() {
      return `${config.serverUrl()}/login/github`;
    },
  },
});
</script>

<style>
  @import '../../node_modules/bootstrap-social/bootstrap-social.css';

  .social ul {
    margin: 0;
    padding: 5px;
    text-align:center;
    display: inline-block;
  }

  .social ul li {
    margin: 10px;
    list-style: none outside none;
    width:8cm;
  }
</style>
