import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AppState {
  selectedLanguageId: number | null;
  setSelectedLanguageId: (languageId: number | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedLanguageId: null,
      setSelectedLanguageId: (selectedLanguageId) =>
        set({ selectedLanguageId }),
    }),
    {
      name: "nawi-narino-app-state",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

