import { ArrowRight, Languages } from "lucide-react-native";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { theme } from "../constants/theme";
import type { Language } from "../types/language";
import { Card } from "./Card";

interface LanguageCardProps {
  language: Language;
}

export function LanguageCard({ language }: LanguageCardProps) {
  return (
    <Link
      href={{
        pathname: "/lenguas/[id]",
        params: { id: String(language.id) },
      }}
      asChild
    >
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Open information about ${language.name}`}
      >
        <Card style={{ marginBottom: theme.spacing.md }}>
          <View className="flex-row items-start">
            <View
              style={{
                alignItems: "center",
                backgroundColor: theme.colors.softGreen,
                borderRadius: theme.radii.button,
                height: 48,
                justifyContent: "center",
                marginRight: theme.spacing.md,
                width: 48,
              }}
            >
              <Languages color={theme.colors.primary} size={22} />
            </View>
            <View className="flex-1">
              <Text
                style={{
                  color: theme.colors.ink,
                  fontSize: 19,
                  fontWeight: "800",
                }}
              >
                {language.name}
              </Text>
              <Text
                style={{
                  color: theme.colors.muted,
                  fontSize: 14,
                  lineHeight: 21,
                  marginTop: theme.spacing.xs,
                }}
              >
                {language.shortDescription}
              </Text>
              {language.isMock ? (
                <Text
                  style={{
                    alignSelf: "flex-start",
                    backgroundColor: theme.colors.mockBackground,
                    borderRadius: theme.radii.pill,
                    color: theme.colors.mockText,
                    fontSize: 11,
                    fontWeight: "800",
                    marginTop: theme.spacing.md,
                    overflow: "hidden",
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.xs,
                  }}
                >
                  DEMO DATA
                </Text>
              ) : null}
            </View>
            <ArrowRight
              color={theme.colors.primary}
              size={20}
              style={{ marginLeft: theme.spacing.sm, marginTop: 4 }}
            />
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}

