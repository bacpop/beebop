<script lang="ts" setup>
import { getApiUrl } from "@/config";
import { useUserStore } from "@/stores/userStore";
import { reactive } from "vue";
import { useRouter } from "vue-router";
const apiUrl = getApiUrl();
const loginUrls = {
  google: `${apiUrl}/login/google`,
  github: `${apiUrl}/login/github`
};
const userStore = useUserStore();
const router = useRouter();
const clickedButton = reactive({
  github: false,
  google: false
});

if (userStore.isAuthenticated) {
  router.push("/");
}
</script>

<template>
  <div class="flex align-items-center justify-content-center">
    <div class="flex flex-column align-items-center justify-content-center">
      <img src="@/assets/log1o.svg" alt="Sakai logo" class="mb-5 w-6rem flex-shrink-0" />
      <div class="login-card">
        <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
          <div class="text-center mb-5">
            <div class="text-900 text-3xl font-medium mb-3">Welcome to Beebop</div>
            <span class="text-600 font-medium">Sign in to continue</span>
          </div>
          <div class="flex flex-column gap-3">
            <a :href="loginUrls.google">
              <Button
                :loading="clickedButton.google"
                @click="clickedButton.google = true"
                label="Sign In With Google"
                icon="pi pi-google"
                size="large"
                class="w-full p-3"
                outlined
              ></Button>
            </a>
            <a :href="loginUrls.github">
              <Button
                :loading="clickedButton.github"
                @click="clickedButton.github = true"
                label="Sign In With Github"
                icon="pi pi-github"
                size="large"
                class="w-full p-3"
                outlined
              ></Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-card {
  width: 550px;
  border-radius: 56px;
  padding: 0.3rem;
  background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%);
}
</style>
