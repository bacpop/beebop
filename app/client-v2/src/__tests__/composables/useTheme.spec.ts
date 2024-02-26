import { DARK_THEME, LIGHT_THEME, useTheme } from "@/composables/useTheme";
import { usePrimeVue } from "primevue/config";
import { ref } from "vue";
import { useStorage } from "@vueuse/core";

// vitest.mock("@vueuse/core", () => ({
//   useStorage: vitest.fn().mockReturnValue(ref(LIGHT_THEME))
// }));
const mockChangeTheme = vitest.fn();
vitest.mock("primevue/config", () => ({
  // replace with actual import path
  usePrimeVue: vitest.fn(() => ({
    changeTheme: mockChangeTheme
  }))
}));

describe("useTheme", () => {
  it("should toggle theme from light to dark", () => {
    const { toggleTheme, themeState } = useTheme();

    toggleTheme();

    expect(themeState.value).toBe(DARK_THEME);
    expect(mockChangeTheme).toHaveBeenCalledWith(LIGHT_THEME, DARK_THEME, "theme-link", expect.any(Function));
  });

  it("should toggle theme from dark to light", () => {
    const { toggleTheme, themeState } = useTheme();
    themeState.value = DARK_THEME;

    toggleTheme();

    expect(themeState.value).toBe(LIGHT_THEME);
    expect(mockChangeTheme).toHaveBeenCalledWith(DARK_THEME, LIGHT_THEME, "theme-link", expect.any(Function));
  });

  it("should set initial theme to light", () => {
    const { setInitialTheme } = useTheme();

    setInitialTheme();

    expect(mockChangeTheme).toHaveBeenCalledWith(DARK_THEME, LIGHT_THEME, "theme-link", expect.any(Function));
  });

  it("should set initial theme to dark", () => {
    const { setInitialTheme } = useTheme();

    setInitialTheme();

    expect(mockChangeTheme).toHaveBeenCalledWith(LIGHT_THEME, DARK_THEME, "theme-link", expect.any(Function));
  });

  it("should return correct theme icon for light theme", () => {
    const { themeIcon, themeState } = useTheme();
    themeState.value = LIGHT_THEME;

    expect(themeIcon.value).toBe("pi pi-sun");
  });

  it("should return correct theme icon for dark theme", () => {
    const { themeIcon, themeState } = useTheme();

    themeState.value = DARK_THEME;

    expect(themeIcon.value).toBe("pi pi-moon");
  });
});
