<template>
  <div class="flex align-items-center justify-content-center min-h-screen">
    <div class="flex flex-column align-items-center justify-content-center">
      <img src="@/assets/log1o.svg" alt="Sakai logo" class="mb-5 w-6rem flex-shrink-0" />
      <div class="not-found-card">
        <div
          class="w-full surface-card py-8 px-5 sm:px-8 flex flex-column align-items-center"
          style="border-radius: 53px"
        >
          <span class="text-blue-500 font-bold text-3xl">404</span>
          <h1 class="text-900 font-bold text-3xl lg:text-5xl mb-2">Not Found</h1>
          <div class="text-600 mb-5">
            Requested resource is not available. See below for places to be redirected to
          </div>
          <router-link
            to="/"
            class="w-full flex align-items-center py-5 border-300 border-bottom-1 no-underline"
          >
            <span
              class="flex justify-content-center align-items-center bg-cyan-400 border-round"
              style="height: 3.5rem; width: 3.5rem"
            >
              <i class="text-50 pi pi-fw pi-home text-2xl"></i>
            </span>
            <span class="ml-4 flex flex-column">
              <span class="text-900 lg:text-xl font-medium mb-0 block">Home Page</span>
            </span>
          </router-link>
          <router-link
            to="/about"
            class="w-full flex align-items-center py-5 border-300 border-bottom-1 no-underline"
          >
            <span
              class="flex justify-content-center align-items-center bg-orange-400 border-round"
              style="height: 3.5rem; width: 3.5rem"
            >
              <i class="pi pi-fw pi-question-circle text-50 text-2xl"></i>
            </span>
            <span class="ml-4 flex flex-column">
              <span class="text-900 lg:text-xl font-medium mb-0">About Page</span>
            </span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-card {
  border-radius: 56px;
  padding: 0.3rem;
  background: linear-gradient(180deg, rgba(33, 150, 243, 0.4) 10%, rgba(33, 150, 243, 0) 30%);
}
</style>
