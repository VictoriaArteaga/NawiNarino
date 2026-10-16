import { Link, type Href } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { theme } from "../constants/theme";
import { Card } from "./Card";
import { MockBadge } from "./MockBadge";

export function InfoCard({
  title,
  description,
  href,
  mock = true,
}: {
  title: string;
  description: string;
  href?: Href;
  mock?: boolean;
}) {
  const content = (
    <Card style={{ marginBottom: theme.spacing.md }}>
      <View className="flex-row items-center">
        <Text
          style={{
            color: theme.colors.ink,
            flex: 1,
            fontSize: 18,
            fontWeight: "800",
          }}
        >
          {title}
        </Text>
        {href ? <ArrowRight color={theme.colors.primary} size={19} /> : null}
      </View>
      <Text
        style={{
          color: theme.colors.muted,
          fontSize: 14,
          lineHeight: 21,
          marginTop: theme.spacing.sm,
        }}
      >
        {description}
      </Text>
      {mock ? <MockBadge /> : null}
    </Card>
  );

  if (!href) return content;
  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="link">{content}</Pressable>
    </Link>
  );
}
