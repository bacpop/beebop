<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { computed, ref } from 'vue';
import { getApiUrl } from '@/config';
import { useUserStore } from '@/stores/userStore';
import { usePrimeVue } from 'primevue/config';
import { useStorage } from '@vueuse/core';
import { useTheme } from '@/composables/useTheme';

const { toggleTheme, themeIcon } = useTheme();
const PrimeVue = usePrimeVue();
const userStore = useUserStore();
const logoutUrl = getApiUrl() + '/logout';
const menu = ref();
const menuItems = computed(() => [
  {
    label: userStore.name,
    items: [
      {
        label: 'logout',
        icon: 'pi pi-fw pi-sign-out',
        url: logoutUrl
      }
    ]
  }
]);
const items = ref([
  {
    label: 'About',
    route: '/about',
    icon: 'pi pi-fw pi-info-circle'
  }
]);

const toggle = (event: MouseEvent) => {
  menu.value.toggle(event);
};
</script>

<template>
  <header>
    <Menubar :model="items" class="fixed z-5 top-0 left-0 w-full h-4rem border-noround">
      <template #start>
        <RouterLink to="/" class="mr-2">
          <img src="@/assets/log2o.svg" alt="logo" class="h-2rem" />
        </RouterLink>
      </template>
      <template #item="{ item, props }">
        <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
          <a v-ripple :href="href" v-bind="props.action" @click="navigate">
            <span :class="item.icon" />
            <span class="ml-2">{{ item.label }}</span>
          </a>
        </router-link>
      </template>
      <template #end>
        <div class="flex gap-3">
          <div><Button :icon="themeIcon" @click="toggleTheme" outlined /></div>
          <div v-if="userStore.isAuthenticated">
            <Button
              type="button"
              outlined
              icon="pi pi-user"
              @click="toggle"
              aria-haspopup="true"
              aria-controls="overlay_menu"
            />
            <Menu ref="menu" id="overlay_menu" :model="menuItems" :popup="true">
              <template #item="{ item, props }">
                <a v-ripple :href="item.url" :target="item.target" v-bind="props.action">
                  <span :class="item.icon" class="text-red-500" />
                  <span class="ml-2 text-red-500">{{ item.label }}</span>
                </a>
              </template>
            </Menu>
          </div>
        </div>
      </template>
    </Menubar>
  </header>
</template>
