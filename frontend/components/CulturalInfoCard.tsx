import { View } from "react-native";

import { theme } from "../constants/theme";
import type { CulturalContent } from "../types/language";
import { Card } from "./Card";
import { Icon } from "./Icon";
import { MockBadge } from "./MockBadge";
import { T } from "./T";

interface CulturalInfoCardProps {
  content: CulturalContent;
  accent?: string;
  tint?: string;
}

export function CulturalInfoCard({
  content,
  accent = theme.colors.primary,
  tint = theme.colors.softGreen,
}: CulturalInfoCardProps) {
  return (
    <Card style={{ marginBottom: theme.spacing.md }}>
      <View style={{ alignItems: "center", flexDirection: "row", gap: 10 }}>
        <View
          style={{
            alignItems: "center",
            backgroundColor: tint,
            borderRadius: 16,
            height: 32,
            justifyContent: "center",
            width: 32,
          }}
        >
          <Icon name="library" size={18} color={accent} />
        </View>
        <T f="display" w={700} s={16} c={theme.colors.ink} style={{ flex: 1 }}>
          {content.title}
        </T>
      </View>
      <T s={14} lh={21} c={theme.colors.muted} style={{ marginTop: theme.spacing.md }}>
        {content.description}
      </T>
      {content.isMock ? (
        <MockBadge label="CONTENIDO DE DEMOSTRACIÓN · PENDIENTE DE VALIDACIÓN" />
      ) : null}
    </Card>
  );
}
