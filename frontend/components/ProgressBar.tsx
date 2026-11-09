import { View } from "react-native";

import { theme } from "../constants/theme";
import { T } from "./T";

interface ProgressBarProps {
  percentage: number;
  label?: string;
  color?: string;
  height?: number;
}

export function ProgressBar({
  percentage,
  label,
  color = theme.colors.accent,
  height = 8,
}: ProgressBarProps) {
  const bounded = Math.max(0, Math.min(100, Math.round(percentage)));

  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      accessibilityValue={{ max: 100, min: 0, now: bounded }}
    >
      {label ? (
        <View
          style={{
            alignItems: "baseline",
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: theme.spacing.sm,
          }}
        >
          <T f="display" w={600} s={13.5} c={theme.colors.ink}>
            {label}
          </T>
          <T w={600} s={13} c={theme.colors.muted}>
            {bounded}%
          </T>
        </View>
      ) : null}
      <View
        style={{
          backgroundColor: theme.colors.track,
          borderRadius: theme.radii.pill,
          height,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            backgroundColor: color,
            borderRadius: theme.radii.pill,
            height,
            width: `${bounded}%`,
          }}
        />
      </View>
    </View>
  );
}
