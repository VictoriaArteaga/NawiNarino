import { Pressable, Text } from "react-native";

import { theme } from "../constants/theme";

interface AnswerOptionProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function AnswerOption({
  label,
  selected,
  onPress,
}: AnswerOptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        backgroundColor: selected ? theme.colors.softGreen : theme.colors.surface,
        borderColor: selected ? theme.colors.primary : theme.colors.border,
        borderRadius: theme.radii.button,
        borderWidth: 1,
        marginTop: theme.spacing.sm,
        padding: theme.spacing.md,
      }}
    >
      <Text style={{ color: theme.colors.ink, fontSize: 15, fontWeight: "600" }}>
        {label}
      </Text>
    </Pressable>
  );
}
