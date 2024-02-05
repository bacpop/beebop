import { useStorage } from '@vueuse/core';
import { usePrimeVue } from 'primevue/config';
import { computed } from 'vue';

export const useTheme = () => {
  const themeState = useStorage('theme', 'aura-light-teal');
  const PrimeVue = usePrimeVue();

  const themeIcon = computed(() =>
    themeState.value === 'aura-light-teal' ? 'pi pi-sun' : 'pi pi-moon'
  );

  const toggleTheme = () => {
    if (themeState.value === 'aura-light-teal') {
      themeState.value = 'aura-dark-teal';
      PrimeVue.changeTheme('aura-light-teal', 'aura-dark-teal', 'theme-link', () => {});
    } else {
      themeState.value = 'aura-light-teal';
      PrimeVue.changeTheme('aura-dark-teal', 'aura-light-teal', 'theme-link', () => {});
    }
  };

  const setInitialTheme = () => {
    if (themeState.value === 'aura-light-teal') {
      PrimeVue.changeTheme('aura-dark-teal', 'aura-light-teal', 'theme-link', () => {});
    } else {
      PrimeVue.changeTheme('aura-light-teal', 'aura-dark-teal', 'theme-link', () => {});
    }
  };

  return { themeState, toggleTheme, setInitialTheme, themeIcon };
};
