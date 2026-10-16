import { Text, View } from "react-native";

import { theme } from "../constants/theme";

interface ProgressBarProps {
  percentage: number;
  label?: string;
}

export function ProgressBar({ percentage, label }: ProgressBarProps) {
  const boundedPercentage = Math.max(0, Math.min(100, percentage));

  return (
    <View accessibilityRole="progressbar">
      {label ? (
        <View className="mb-2 flex-row justify-between">
          <Text style={{ color: theme.colors.ink, fontWeight: "700" }}>
            {label}
          </Text>
          <Text style={{ color: theme.colors.muted }}>
            {boundedPercentage}%
          </Text>
        </View>
      ) : null}
      <View
        style={{
          backgroundColor: theme.colors.border,
          borderRadius: theme.radii.pill,
          height: 10,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radii.pill,
            height: 10,
            width: `${boundedPercentage}%`,
          }}
        />
      </View>
    </View>
  );
}
