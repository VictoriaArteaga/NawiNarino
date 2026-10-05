import { Pressable, Text, type StyleProp, type ViewStyle } from "react-native";

import { theme } from "../constants/theme";

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
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          alignItems: "center",
          backgroundColor: isPrimary
            ? theme.colors.primary
            : theme.colors.softGreen,
          borderRadius: theme.radii.button,
          justifyContent: "center",
          minHeight: 54,
          opacity: disabled ? 0.55 : pressed ? 0.84 : 1,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: isPrimary ? theme.colors.surface : theme.colors.primaryDark,
          fontSize: 16,
          fontWeight: "700",
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}

