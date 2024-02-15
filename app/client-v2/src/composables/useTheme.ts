import { useStorage } from '@vueuse/core';
import { usePrimeVue } from 'primevue/config';
import { computed } from 'vue';

export const useTheme = () => {
  const lightThemeName = 'aura-light-teal';
  const darkThemeName = 'aura-dark-teal';
  const themeState = useStorage('theme', lightThemeName);
  const PrimeVue = usePrimeVue();

  const themeIcon = computed(() =>
    themeState.value === lightThemeName ? 'pi pi-sun' : 'pi pi-moon'
  );

  const toggleTheme = () => {
    if (themeState.value === lightThemeName) {
      themeState.value = darkThemeName;
      PrimeVue.changeTheme(lightThemeName, darkThemeName, 'theme-link', () => {});
    } else {
      themeState.value = lightThemeName;
      PrimeVue.changeTheme(darkThemeName, lightThemeName, 'theme-link', () => {});
    }
  };

  const setInitialTheme = () => {
    if (themeState.value === lightThemeName) {
      PrimeVue.changeTheme(darkThemeName, lightThemeName, 'theme-link', () => {});
    } else {
      PrimeVue.changeTheme(lightThemeName, darkThemeName, 'theme-link', () => {});
    }
  };

  return { themeState, toggleTheme, setInitialTheme, themeIcon };
};
