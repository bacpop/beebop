<template>
  <div>
    <p>Nice to see you, {{user.data.name}}!</p>
    <a href=http://localhost:4000/logout class="btn-logout">Logout</a>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'vuex';

export default defineComponent({
  name: 'GreetingAndLogout',
  mounted() {
    this.getUser();
  },
  methods: {
    ...mapActions(['getUser']),
  },
  computed: mapState(['user']),
});
</script>

<style scoped>
  .btn-logout{
    color:#fff;
    background-color:#9099a0;
    border-color:rgba(0,0,0,0.2);
    padding:6px 12px;
    line-height:40px;
    font-size:1.3em;
    text-align:center;
    font-weight:400;
    text-align:center;
    vertical-align:middle;
    cursor:pointer;
    border:1px solid transparent;
    border-radius:4px;
    text-decoration: none;
  }

  .btn-logout:hover{
    color:#fff;
    background-color:#42b983;
    border-color:rgba(0,0,0,0.2);
    text-decoration: none;
  }

</style>
