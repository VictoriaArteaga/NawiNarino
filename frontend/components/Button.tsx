import {
  ActivityIndicator,
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { shadows, theme } from "../constants/theme";
import { T } from "./T";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  /** Muestra un indicador de carga junto al título y bloquea el botón. */
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const isPrimary = variant === "primary";
  const inactive = disabled || loading;
  const textColor = isPrimary ? "#FFFFFF" : theme.colors.primaryDark;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: inactive }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        {
          alignItems: "center",
          backgroundColor: isPrimary
            ? theme.colors.accent
            : theme.colors.softGreen,
          borderRadius: 15,
          justifyContent: "center",
          minHeight: 52,
          opacity: inactive && !loading ? 0.55 : pressed ? 0.86 : 1,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
        },
        isPrimary && !inactive ? shadows.soft : undefined,
        style,
      ]}
    >
      <View style={{ alignItems: "center", flexDirection: "row", gap: 10 }}>
        {loading ? <ActivityIndicator color={textColor} size="small" /> : null}
        <T f="display" w={700} s={16} c={textColor}>
          {title}
        </T>
      </View>
    </Pressable>
  );
}
