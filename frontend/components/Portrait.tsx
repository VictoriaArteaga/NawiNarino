import { View } from "react-native";

import type { LanguageTheme } from "../constants/languages";
import { T } from "./T";

interface PortraitProps {
  language: LanguageTheme;
  size: number;
  /** Border thickness in px (0 = none). */
  ring?: number;
  ringColor?: string;
  /** Initials shown when the language has no illustrated portrait. */
  fallbackLabel?: string;
  accessibilityLabel?: string;
}

/** Circular crop of a language's illustrated portrait. */
export function Portrait({
  language,
  size,
  ring = 0,
  ringColor,
  fallbackLabel = "",
  accessibilityLabel,
}: PortraitProps) {
  const Art = language.Portrait;

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityLabel ? "image" : undefined}
      style={{
        alignItems: "center",
        backgroundColor: language.dark,
        borderColor: ringColor ?? language.ring,
        borderRadius: size / 2,
        borderWidth: ring,
        height: size,
        justifyContent: "center",
        overflow: "hidden",
        width: size,
      }}
    >
      {Art ? (
        <Art preserveAspectRatio="xMidYMin slice" />
      ) : (
        <T f="display" w={800} s={size * 0.36} c="#FFFFFF">
          {fallbackLabel.slice(0, 2).toUpperCase()}
        </T>
      )}
    </View>
  );
}
