import { ActivityIndicator, View } from "react-native";

import { theme } from "../constants/theme";
import { T } from "./T";

interface LoadingProps {
  label?: string;
}

export function Loading({ label = "Cargando información..." }: LoadingProps) {
  return (
    <View
      accessibilityLiveRegion="polite"
      style={{ alignItems: "center", justifyContent: "center", paddingVertical: 48 }}
    >
      <ActivityIndicator color={theme.colors.primary} size="large" />
      <T s={15} c={theme.colors.muted} style={{ marginTop: theme.spacing.md }}>
        {label}
      </T>
    </View>
  );
}
