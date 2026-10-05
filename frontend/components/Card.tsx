import type { PropsWithChildren } from "react";
import { View, type ViewStyle } from "react-native";

import { theme } from "../constants/theme";

interface CardProps extends PropsWithChildren {
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.card,
          borderWidth: 1,
          padding: theme.spacing.lg,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

