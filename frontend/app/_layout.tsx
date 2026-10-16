import "../global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { theme } from "../constants/theme";
import { ApiError } from "../services/api";

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

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
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
