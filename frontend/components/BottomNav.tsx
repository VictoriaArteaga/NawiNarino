import { useRouter, type Href } from "expo-router";
import { View } from "react-native";
import { Pressable } from "./Pressable";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { theme, tone } from "../constants/theme";
import { Icon, type IconName } from "./Icon";
import { T } from "./T";

export type NavKey = "inicio" | "aprender" | "mapa" | "explorar";

const items: { key: NavKey; label: string; icon: IconName; href: Href }[] = [
  { key: "inicio", label: "Inicio", icon: "home", href: "/inicio" },
  { key: "aprender", label: "Aprender", icon: "book", href: "/lenguas" },
  { key: "mapa", label: "Mapa", icon: "pin", href: "/mapa" },
  { key: "explorar", label: "Explorar", icon: "compass", href: "/patrimonio" },
];

/** Height the bottom navigation occupies, including the safe-area inset. */
export function useNavHeight() {
  const { bottom } = useSafeAreaInsets();
  return theme.layout.navHeight - 6 + Math.max(bottom, 6);
}

interface BottomNavProps {
  active: NavKey;
  activeColor?: string;
}

export function BottomNav({
  active,
  activeColor = theme.colors.accent,
}: BottomNavProps) {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const height = theme.layout.navHeight - 6 + Math.max(bottom, 6);

  return (
    <View
      accessibilityRole="tablist"
      style={{
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.border,
        borderTopWidth: 1,
        bottom: 0,
        flexDirection: "row",
        height,
        left: 0,
        paddingBottom: Math.max(bottom, 6),
        position: "absolute",
        right: 0,
      }}
    >
      {items.map((item) => {
        const isActive = item.key === active;
        const color = isActive ? activeColor : tone("#4A4740");
        return (
          <Pressable
            key={item.key}
            accessibilityLabel={item.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => {
              if (!isActive) router.replace(item.href);
            }}
            style={{
              alignItems: "center",
              flex: 1,
              gap: 4,
              justifyContent: "center",
            }}
          >
            <Icon
              name={item.icon}
              size={26}
              color={color}
              fill={isActive && item.key === "inicio" ? color : "none"}
              strokeWidth={1.7}
            />
            <T f="display" w={isActive ? 700 : 500} s={11.5} c={color}>
              {item.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}
