import { View } from "react-native";

import { theme } from "../constants/theme";
import { T } from "./T";

/** A small uppercase label followed by its value, for detail cards. */
export function Field({
  label,
  value,
  first = false,
}: {
  label: string;
  value: string;
  first?: boolean;
}) {
  return (
    <View style={{ marginTop: first ? 0 : theme.spacing.lg - 4 }}>
      <T f="display" w={700} s={11.5} ls={0.8} c={theme.colors.primary}>
        {label.toUpperCase()}
      </T>
      <T s={15} lh={22} c={theme.colors.ink} style={{ marginTop: 4 }}>
        {value}
      </T>
    </View>
  );
}
