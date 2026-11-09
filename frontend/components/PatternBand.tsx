import { View, type StyleProp, type ViewStyle } from "react-native";

import { theme } from "../constants/theme";
import { PatternArt } from "./art/PatternArt";

/** Decorative band built from the "patrón Ñawi" artwork. */
export function PatternBand({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[{ height: theme.layout.bandHeight, width: "100%" }, style]}
    >
      <PatternArt preserveAspectRatio="xMidYMid slice" />
    </View>
  );
}
