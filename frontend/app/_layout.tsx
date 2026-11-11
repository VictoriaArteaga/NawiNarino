import "../global.css";

import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from "@expo-google-fonts/outfit";
import {
  NunitoSans_400Regular,
  NunitoSans_400Regular_Italic,
  NunitoSans_600SemiBold,
  NunitoSans_600SemiBold_Italic,
  NunitoSans_700Bold,
} from "@expo-google-fonts/nunito-sans";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { theme } from "../constants/theme";
import { ApiError } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { useAppearance, useSettingsStore } from "../store/settingsStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) =>
        failureCount < 1 &&
        (!(error instanceof ApiError) ||
          error.status === undefined ||
          error.status >= 500),
      staleTime: 30_000,
    },
  },
});

/** Pantallas que se pueden ver sin cuenta: bienvenida, inicio de sesión y registro. */
const PUBLIC_SEGMENTS = new Set(["login", "registro"]);

/**
 * Puerta de acceso: sin sesión solo se ven las pantallas públicas; con sesión,
 * login y registro llevan directo al inicio. Espera a leer la sesión guardada.
 */
function AuthGate() {
  const router = useRouter();
  const segments = useSegments() as string[];
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuthenticated = useAuthStore((s) => s.token !== null);
  const first = segments[0];

  useEffect(() => {
    if (!hydrated) return;
    const isWelcome = first === undefined || first === "index";
    if (!isAuthenticated && !isWelcome && !PUBLIC_SEGMENTS.has(first)) {
      router.replace("/login");
    } else if (isAuthenticated && PUBLIC_SEGMENTS.has(first)) {
      router.replace("/inicio");
    }
  }, [hydrated, isAuthenticated, first, router]);

  return null;
}

export default function RootLayout() {
  const authReady = useAuthStore((s) => s.hydrated);
  const settingsReady = useSettingsStore((s) => s.hydrated);
  const { dark } = useAppearance();
  const [fontsLoaded, fontError] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    NunitoSans_400Regular,
    NunitoSans_400Regular_Italic,
    NunitoSans_600SemiBold,
    NunitoSans_600SemiBold_Italic,
    NunitoSans_700Bold,
  });

  // Keep the cream background while the brand fonts load. If loading fails the
  // app still opens with the system font instead of blocking the user.
  if ((!fontsLoaded && !fontError) || !authReady || !settingsReady) {
    return <View style={{ backgroundColor: theme.colors.canvas, flex: 1 }} />;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style={dark ? "light" : "dark"} />
        <AuthGate />
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: theme.colors.canvas },
            headerShown: false,
          }}
        />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
