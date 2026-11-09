import { View } from "react-native";

import { theme } from "../constants/theme";
import { T } from "./T";

/** Marks content that is temporary demonstration data (not verified). */
export function MockBadge({ label = "DATOS DE DEMOSTRACIÓN" }: { label?: string }) {
  return (
    <View
      style={{
        alignSelf: "flex-start",
        backgroundColor: theme.colors.mockBackground,
        borderRadius: theme.radii.pill,
        marginTop: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
      }}
    >
      <T f="display" w={700} s={11} c={theme.colors.mockText} ls={0.3}>
        {label}
      </T>
    </View>
  );
}
