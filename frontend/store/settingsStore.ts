import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { applyPalette } from "../constants/theme";

export type AppLanguage = "es" | "en";

interface SettingsState {
  /** Idioma de la interfaz. */
  language: AppLanguage;
  /** Modo oscuro. */
  dark: boolean;
  /** true cuando ya se leyeron las preferencias guardadas en el dispositivo. */
  hydrated: boolean;
  setLanguage: (language: AppLanguage) => void;
  setDark: (dark: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: "es",
      dark: false,
      hydrated: false,
      setLanguage: (language) => set({ language }),
      // La paleta se cambia antes de avisar a las pantallas, para que ya se dibujen con los colores nuevos.
      setDark: (dark) => {
        applyPalette(dark);
        set({ dark });
      },
    }),
    {
      name: "nawi-narino-settings",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ language, dark }) => ({ language, dark }),
      onRehydrateStorage: () => (state) => {
        applyPalette(state?.dark ?? false);
        useSettingsStore.setState({ hydrated: true });
      },
    },
  ),
);

/**
 * Hace que la pantalla que lo usa se vuelva a dibujar cuando cambian el idioma o el modo oscuro.
 * Los colores se leen de `theme.colors` al renderizar, así que basta con volver a renderizar.
 */
export function useAppearance() {
  const dark = useSettingsStore((s) => s.dark);
  const language = useSettingsStore((s) => s.language);
  return { dark, language };
}
