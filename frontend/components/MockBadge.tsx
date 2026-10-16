import { Text } from "react-native";

import { theme } from "../constants/theme";

export function MockBadge() {
  return (
    <Text
      style={{
        alignSelf: "flex-start",
        backgroundColor: theme.colors.mockBackground,
        borderRadius: theme.radii.pill,
        color: theme.colors.mockText,
        fontSize: 11,
        fontWeight: "800",
        marginTop: theme.spacing.sm,
        overflow: "hidden",
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
      }}
    >
      DEMONSTRATION DATA
    </Text>
  );
}
