import { ArrowLeft } from "lucide-react-native";
import { Link, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { theme } from "../constants/theme";

interface HeaderProps {
  title: string;
  subtitle?: string;
  backHref?: Href;
  backLabel?: string;
}

export function Header({
  title,
  subtitle,
  backHref,
  backLabel = "Back",
}: HeaderProps) {
  return (
    <View className="mb-6">
      {backHref ? (
        <Link href={backHref} asChild>
          <Pressable
            accessibilityRole="link"
            className="mb-5 flex-row items-center self-start"
          >
            <ArrowLeft color={theme.colors.primary} size={18} />
            <Text
              style={{
                color: theme.colors.primary,
                fontSize: 14,
                fontWeight: "700",
                marginLeft: theme.spacing.sm,
              }}
            >
              {backLabel}
            </Text>
          </Pressable>
        </Link>
      ) : null}
      <Text
        style={{
          color: theme.colors.primary,
          fontSize: 12,
          fontWeight: "800",
          letterSpacing: 1.8,
          marginBottom: theme.spacing.sm,
        }}
      >
        ÑAWI-NARIÑO
      </Text>
      <Text
        style={{
          color: theme.colors.ink,
          fontSize: 30,
          fontWeight: "800",
          letterSpacing: -0.6,
        }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={{
            color: theme.colors.muted,
            fontSize: 16,
            lineHeight: 24,
            marginTop: theme.spacing.sm,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

