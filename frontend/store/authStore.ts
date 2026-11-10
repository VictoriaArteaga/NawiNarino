import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

import type { AuthResponse, User } from "../types/auth";

/**
 * El token se guarda en el almacén seguro del sistema (Keychain / Keystore) en iOS y Android.
 * En web no existe ese almacén: se usa el almacenamiento del navegador.
 */
const secureStorage: StateStorage =
  Platform.OS === "web"
    ? AsyncStorage
    : {
        getItem: (name) => SecureStore.getItemAsync(name),
        setItem: (name, value) => SecureStore.setItemAsync(name, value),
        removeItem: (name) => SecureStore.deleteItemAsync(name),
      };

interface AuthState {
  token: string | null;
  user: User | null;
  /** true cuando ya se leyó la sesión guardada en el dispositivo. */
  hydrated: boolean;
  setSession: (session: AuthResponse) => void;
  setUser: (user: User) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hydrated: false,
      setSession: ({ accessToken, user }) => set({ token: accessToken, user }),
      setUser: (user) => set({ user }),
      clearSession: () => set({ token: null, user: null }),
    }),
    {
      name: "nawi-narino-auth",
      storage: createJSONStorage(() => secureStorage),
      partialize: ({ token, user }) => ({ token, user }),
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hydrated: true });
      },
    },
  ),
);

/** Identificador del progreso: el del usuario con sesión, o el perfil demo compartido. */
export function selectProgressUserId(state: AuthState): string {
  return state.user ? String(state.user.id) : "local-demo-user";
}
