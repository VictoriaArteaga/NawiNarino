import { AudioLines, BookOpen } from "lucide-react-native";
import { Text, View } from "react-native";

import { theme } from "../constants/theme";
import type { Vocabulary } from "../types/vocabulary";
import { Card } from "./Card";

interface VocabularyCardProps {
  item: Vocabulary;
}

export function VocabularyCard({ item }: VocabularyCardProps) {
  return (
    <Card style={{ marginBottom: theme.spacing.md }}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text
            style={{
              color: theme.colors.ink,
              fontSize: 20,
              fontWeight: "800",
            }}
          >
            {item.word}
          </Text>
          <Text
            style={{
              color: theme.colors.primary,
              fontSize: 16,
              fontWeight: "700",
              marginTop: theme.spacing.xs,
            }}
          >
            {item.translation}
          </Text>
        </View>
        {item.audioUrl ? (
          <AudioLines color={theme.colors.primary} size={20} />
        ) : (
          <BookOpen color={theme.colors.primary} size={20} />
        )}
      </View>
      <Text
        style={{
          color: theme.colors.accent,
          fontSize: 12,
          fontWeight: "800",
          marginTop: theme.spacing.md,
          textTransform: "uppercase",
        }}
      >
        {item.category}
      </Text>
      <Text
        style={{
          color: theme.colors.muted,
          fontSize: 14,
          lineHeight: 21,
          marginTop: theme.spacing.sm,
        }}
      >
        {item.description}
      </Text>
      {item.isMock ? (
        <Text
          style={{
            color: theme.colors.mockText,
            fontSize: 12,
            fontWeight: "700",
            marginTop: theme.spacing.md,
          }}
        >
          Demonstration data · Pending validation
        </Text>
      ) : null}
    </Card>
  );
}

