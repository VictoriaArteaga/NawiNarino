import { type Href } from "expo-router";
import { View } from "react-native";

import { theme } from "../constants/theme";
import { BackButton } from "./CircleButton";
import { T } from "./T";

interface HeaderProps {
  title: string;
  subtitle?: string;
  backHref?: Href;
  backLabel?: string;
}

/** Simple title block with a round back button, for screens without an illustration. */
export function Header({ title, subtitle, backHref, backLabel = "Volver" }: HeaderProps) {
  return (
    <View style={{ marginBottom: theme.spacing.lg }}>
      {backHref ? (
        <View style={{ marginBottom: theme.spacing.md }}>
          <BackButton
            fallback={backHref}
            label={backLabel}
            color={theme.colors.heading}
            background={theme.colors.surface}
            borderColor={theme.colors.border}
          />
        </View>
      ) : null}
      <T f="display" w={800} s={28} lh={33} c={theme.colors.heading}>
        {title}
      </T>
      {subtitle ? (
        <T s={15} lh={22} c={theme.colors.muted} style={{ marginTop: theme.spacing.sm }}>
          {subtitle}
        </T>
      ) : null}
    </View>
  );
}
