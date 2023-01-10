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
import { defineComponent } from "vue";
import { mapState, mapActions } from "vuex";
import LoginPrompt from "@/components/LoginPrompt.vue";
import SelectAction from "@/components/SelectAction.vue";

export default defineComponent({
    name: "HomeView",
    components: {
        LoginPrompt,
        SelectAction
    },
    mounted() {
        this.getUser();
    },
    methods: {
        ...mapActions(["getUser"])
    },
    computed: {
        ...mapState(["user"])
    }
});
</script>
