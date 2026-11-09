import { useRouter, type Href } from "expo-router";
import { Pressable, View } from "react-native";

import { theme } from "../constants/theme";
import { Card } from "./Card";
import { Icon } from "./Icon";
import { MockBadge } from "./MockBadge";
import { T } from "./T";

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
  const router = useRouter();
  const content = (
    <Card style={{ marginBottom: theme.spacing.md }}>
      <View style={{ alignItems: "center", flexDirection: "row" }}>
        <T f="display" w={700} s={17} c={theme.colors.ink} style={{ flex: 1 }}>
          {title}
        </T>
        {href ? (
          <Icon name="arrowRight" size={19} color={theme.colors.accent} strokeWidth={2.2} />
        ) : null}
      </View>
      <T s={14} lh={21} c={theme.colors.muted} style={{ marginTop: theme.spacing.sm }}>
        {description}
      </T>
      {mock ? <MockBadge /> : null}
    </Card>
  );

  if (!href) return content;
  return (
    <Pressable accessibilityRole="link" onPress={() => router.push(href)}>
      {content}
    </Pressable>
  );
}
