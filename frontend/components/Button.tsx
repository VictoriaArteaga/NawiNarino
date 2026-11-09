import { Pressable, type StyleProp, type ViewStyle } from "react-native";

import { theme } from "../constants/theme";
import { T } from "./T";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  style,
}: ButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
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
          opacity: disabled ? 0.55 : pressed ? 0.86 : 1,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
        },
        style,
      ]}
    >
      <T
        f="display"
        w={700}
        s={16}
        c={isPrimary ? "#FFFFFF" : theme.colors.primaryDark}
      >
        {title}
      </T>
    </Pressable>
  );
}
