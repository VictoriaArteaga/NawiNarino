import { View } from "react-native";

import { shadows, theme } from "../constants/theme";
import type { Vocabulary } from "../types/vocabulary";
import { GradientBox } from "./GradientBox";
import { Icon } from "./Icon";
import { T } from "./T";

interface VocabularyCardProps {
  item: Vocabulary;
  /** Tag colors; chosen by the screen from the category. */
  tagBackground: string;
  tagColor: string;
}

export function VocabularyCard({ item, tagBackground, tagColor }: VocabularyCardProps) {
  return (
    <View
      accessibilityLabel={`${item.word}: ${item.translation}. Categoría ${item.category}.`}
      style={[
        {
          alignItems: "center",
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: 18,
          borderWidth: 1,
          flexDirection: "row",
          gap: 14,
          minHeight: 84,
          paddingHorizontal: 12,
          paddingVertical: 12,
        },
        shadows.soft,
      ]}
    >
      <GradientBox
        colors={["#2F6F4E", "#4C8B6C"]}
        direction="br"
        style={{
          alignItems: "center",
          borderRadius: 25,
          height: 50,
          justifyContent: "center",
          opacity: item.audioUrl ? 1 : 0.55,
          width: 50,
        }}
      >
        <Icon name="speaker" size={24} color="#FFFFFF" />
      </GradientBox>
      <View style={{ flex: 1, minWidth: 0 }}>
        <T f="display" w={800} s={21} lh={25} c={theme.colors.ink} numberOfLines={2}>
          {item.word}
        </T>
        <T s={14} lh={18} c="#4B554F" numberOfLines={2}>
          {item.translation}
        </T>
      </View>
      <View
        style={{
          backgroundColor: tagBackground,
          borderRadius: 12,
          maxWidth: 110,
          paddingHorizontal: 10,
          paddingVertical: 3,
        }}
      >
        <T w={700} s={11.5} c={tagColor} numberOfLines={1}>
          {item.category}
        </T>
      </View>
    </View>
  );
}
