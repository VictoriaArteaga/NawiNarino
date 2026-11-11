import { ActivityIndicator, View, type StyleProp, type ViewStyle } from "react-native";
import { Pressable } from "./Pressable";

import { shadows, theme, tone } from "../constants/theme";
import { T } from "./T";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
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
  const isOutline = variant === "outline";
  const textColor = isPrimary ? "#FFFFFF" : isOutline ? theme.colors.accent : theme.colors.heading;

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
            : isOutline
              ? tone("rgba(251,243,230,0.96)")
              : theme.colors.softGreen,
          borderColor: isOutline ? theme.colors.accent : "transparent",
          borderRadius: 15,
          borderWidth: isOutline ? 2 : 0,
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
