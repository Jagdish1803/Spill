import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: "light",
      isDarkMode: false,

      // Set theme explicitly
      setTheme: (mode) => {
        const isDark = mode === "dark";
        set({ 
          theme: mode, 
          isDarkMode: isDark 
        });

        if (isDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      },

      // Toggle theme
      toggleTheme: () => {
        const { isDarkMode } = get();
        get().setTheme(isDarkMode ? "light" : "dark");
      },

      // Initialize with saved or system preference
      initializeTheme: () => {
        const savedTheme = get().theme;
        if (savedTheme) {
          get().setTheme(savedTheme);
        } else {
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          get().setTheme(prefersDark ? "dark" : "light");
        }
      },
    }),
    {
      name: "theme-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.initializeTheme();
        }
      },
    }
  )
);
