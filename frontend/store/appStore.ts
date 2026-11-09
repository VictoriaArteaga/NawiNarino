import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AppState {
  selectedLanguageId: number | null;
  setSelectedLanguageId: (languageId: number | null) => void;
  /** Languages the learner saved with the heart button (stored on this device only). */
  savedLanguageIds: number[];
  toggleSavedLanguage: (languageId: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedLanguageId: null,
      setSelectedLanguageId: (selectedLanguageId) =>
        set({ selectedLanguageId }),
      savedLanguageIds: [],
      toggleSavedLanguage: (languageId) =>
        set((state) => ({
          savedLanguageIds: state.savedLanguageIds.includes(languageId)
            ? state.savedLanguageIds.filter((id) => id !== languageId)
            : [...state.savedLanguageIds, languageId],
        })),
    }),
    {
      name: "nawi-narino-app-state",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
