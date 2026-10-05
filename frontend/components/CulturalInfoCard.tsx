import { Info } from "lucide-react-native";
import { Text, View } from "react-native";

import { theme } from "../constants/theme";
import type { CulturalContent } from "../types/language";
import { Card } from "./Card";

interface CulturalInfoCardProps {
  content: CulturalContent;
}

export function CulturalInfoCard({ content }: CulturalInfoCardProps) {
  return (
    <Card style={{ marginBottom: theme.spacing.md }}>
      <View className="flex-row items-center">
        <Info color={theme.colors.primary} size={18} />
        <Text
          style={{
            color: theme.colors.ink,
            fontSize: 17,
            fontWeight: "800",
            marginLeft: theme.spacing.sm,
          }}
        >
          {content.title}
        </Text>
      </View>
      <Text
        style={{
          color: theme.colors.muted,
          fontSize: 14,
          lineHeight: 22,
          marginTop: theme.spacing.md,
        }}
      >
        {content.description}
      </Text>
      {content.isMock ? (
        <Text
          style={{
            color: theme.colors.mockText,
            fontSize: 12,
            fontWeight: "700",
            marginTop: theme.spacing.md,
          }}
        >
          Demonstration content · Pending validation
        </Text>
      ) : null}
    </Card>
  );
}

