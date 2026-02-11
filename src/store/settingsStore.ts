import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  theme: "light" | "dark" | "system";
  mode: "ios" | "md";
  setTheme: (theme: "light" | "dark" | "system") => void;
  setMode: (mode: "ios" | "md") => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      mode: "ios",
      setTheme: (theme) => set({ theme }),
      setMode: (mode) => set({ mode }),
    }),
    {
      name: "app-settings",
    },
  ),
);
