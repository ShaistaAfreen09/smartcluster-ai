import { create } from "zustand";

interface ThemeState {
  darkMode: boolean;
  toggleTheme: () => void;
  setDarkMode: (dark: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  const cachedTheme = localStorage.getItem("smartcluster_theme");
  const initialDark = cachedTheme !== null ? cachedTheme === "dark" : true; // Default to dark futuristic cyberpunk

  // Sync index class
  if (initialDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  return {
    darkMode: initialDark,
    toggleTheme: () => set((state) => {
      const newDark = !state.darkMode;
      localStorage.setItem("smartcluster_theme", newDark ? "dark" : "light");
      if (newDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return { darkMode: newDark };
    }),
    setDarkMode: (dark) => {
      localStorage.setItem("smartcluster_theme", dark ? "dark" : "light");
      if (dark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      set({ darkMode: dark });
    }
  };
});
