import { useStorage } from "@vueuse/core";
import { usePrimeVue } from "primevue/config";
import { computed } from "vue";

export const LIGHT_THEME = "aura-light-teal";
export const DARK_THEME = "aura-dark-teal";

export const useTheme = () => {
  const themeState = useStorage("theme", LIGHT_THEME);
  const PrimeVue = usePrimeVue();

  const themeIcon = computed(() => (themeState.value === LIGHT_THEME ? "pi pi-sun" : "pi pi-moon"));

  const toggleTheme = () => {
    if (themeState.value === LIGHT_THEME) {
      themeState.value = DARK_THEME;
      PrimeVue.changeTheme(LIGHT_THEME, DARK_THEME, "theme-link", () => {});
    } else {
      themeState.value = LIGHT_THEME;
      PrimeVue.changeTheme(DARK_THEME, LIGHT_THEME, "theme-link", () => {});
    }
  };

  const setInitialTheme = () => {
    if (themeState.value === LIGHT_THEME) {
      PrimeVue.changeTheme(DARK_THEME, LIGHT_THEME, "theme-link", () => {});
    } else {
      PrimeVue.changeTheme(LIGHT_THEME, DARK_THEME, "theme-link", () => {});
    }
  };

  return { themeState, toggleTheme, setInitialTheme, themeIcon };
};
