import { useRouter, type Href } from "expo-router";
import { Pressable, View } from "react-native";

import { ProfileHero } from "../components/art/ProfileHero";
import { Avatar } from "../components/Avatar";
import { BackButton } from "../components/CircleButton";
import { Hero, useHeaderTop } from "../components/Hero";
import { Icon, type IconName } from "../components/Icon";
import { PatternBand } from "../components/PatternBand";
import { Portrait } from "../components/Portrait";
import { ScreenLayout } from "../components/ScreenLayout";
import { T } from "../components/T";
import { getLanguageTheme, sortLanguages } from "../constants/languages";
import { theme } from "../constants/theme";
import { useLogout } from "../hooks/useAuth";
import { useLanguages } from "../hooks/useLanguages";
import { useLanguageProgress, useProgress } from "../hooks/useLearning";
import { useAppStore } from "../store/appStore";
import { useAuthStore } from "../store/authStore";
import type { Language } from "../types/language";

interface MenuItem {
  label: string;
  icon: IconName;
  bg: string;
  color: string;
  href?: Href;
  badge?: string;
  danger?: boolean;
  action?: "logout";
}

export default function ProfileScreen() {
  const router = useRouter();
  const headerTop = useHeaderTop();
  const languages = useLanguages();
  const progress = useProgress();
  const savedCount = useAppStore((s) => s.savedLanguageIds.length);
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  const learnItems: MenuItem[] = [
    { label: "Mi progreso", icon: "chart", bg: "#E4EFE6", color: "#2F6F4E", href: "/progreso" },
    {
      label: "Lenguas guardadas",
      icon: "bookmark",
      bg: "#E6DDF3",
      color: "#6B4A9E",
      href: "/lenguas",
      badge: savedCount > 0 ? String(savedCount) : undefined,
    },
    { label: "Mis actividades", icon: "tasks", bg: "#FBE3D6", color: "#C84A1F", href: "/progreso" },
  ];
  const accountItems: MenuItem[] = [
    { label: "Ajustes", icon: "sliders", bg: "#DCEAF6", color: "#1D4A75", badge: "Pronto" },
    { label: "Ayuda y soporte", icon: "help", bg: "#F8E4C0", color: "#8A5200", badge: "Pronto" },
    { label: "Cerrar sesión", icon: "logout", bg: "#FBE4E1", color: "#A3281C", danger: true, action: "logout" },
  ];

  return (
    <ScreenLayout bottomSpace={0}>
      <Hero height={190} art={<ProfileHero preserveAspectRatio="xMidYMin slice" />}>
        <View style={{ left: 14, position: "absolute", top: headerTop }}>
          <BackButton fallback="/inicio" />
        </View>
        <View style={{ left: 68, position: "absolute", top: headerTop + 4 }}>
          <T accessibilityRole="header" f="display" w={800} s={23} lh={28} c={theme.colors.primaryDark}>
            Perfil
          </T>
        </View>
      </Hero>

      {/* Identity */}
      <View style={{ alignItems: "center", marginTop: -58 }}>
        <Avatar size={96} ring progress={progress.data?.percentage ?? 0} />
        <T f="display" w={800} s={22} lh={27} c={theme.colors.ink} style={{ marginTop: 8 }}>
          {user?.name ?? "Explorador/a Ñawi"}
        </T>
        <T s={13.5} c={theme.colors.muted}>
          {user?.email ?? "Sin sesión iniciada"}
        </T>
        <View style={{ alignItems: "center", flexDirection: "row", gap: 8, marginTop: 12 }}>
          <Chip bg={theme.colors.gold} color="#2B1D05" icon="star" label={`${Math.round(progress.data?.percentage ?? 0)}% total`} />
          <Chip bg="#FBE3D6" color={theme.colors.accent} icon="flame" label={`${progress.data?.completedActivities ?? 0} actividades`} />
          <Chip bg="#E4EFE6" color="#1F5C3A" label={`${savedCount} guardadas`} />
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        {/* My languages */}
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: 18,
            borderWidth: 1,
            paddingHorizontal: 14,
            paddingVertical: 12,
          }}
        >
          <View style={{ alignItems: "baseline", flexDirection: "row", justifyContent: "space-between" }}>
            <T f="display" w={700} s={16} c={theme.colors.primaryDark}>
              Mis lenguas
            </T>
            <Pressable accessibilityRole="link" onPress={() => router.push("/lenguas")} hitSlop={10}>
              <T w={700} s={12.5} c={theme.colors.accent}>
                Ver todas
              </T>
            </Pressable>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
            {sortLanguages(languages.data ?? []).slice(0, 4).map((language) => (
              <LanguageChip key={language.id} language={language} />
            ))}
            {languages.isPending ? (
              <T s={13} c={theme.colors.muted}>
                Cargando lenguas…
              </T>
            ) : null}
            {languages.isError ? (
              <T s={13} c={theme.colors.danger}>
                No pudimos cargar tus lenguas.
              </T>
            ) : null}
          </View>
        </View>

        <MenuCard items={learnItems} onOpen={(href) => router.push(href)} />
        <MenuCard
          items={accountItems}
          onAction={(action) => {
            if (action === "logout") {
              logout();
              router.replace("/");
            }
          }}
          onOpen={(href) => router.push(href)}
        />
      </View>

      <View style={{ marginTop: 16 }}>
        <PatternBand />
      </View>
    </ScreenLayout>
  );
}

function Chip({
  bg,
  color,
  icon,
  label,
}: {
  bg: string;
  color: string;
  icon?: IconName;
  label: string;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: bg,
        borderRadius: 15,
        flexDirection: "row",
        gap: 5,
        height: 30,
        paddingHorizontal: 11,
      }}
    >
      {icon ? <Icon name={icon} size={14} color={color} fill={color} strokeWidth={1} /> : null}
      <T f="display" w={800} s={12.5} c={color}>
        {label}
      </T>
    </View>
  );
}

function LanguageChip({ language }: { language: Language }) {
  const router = useRouter();
  const look = getLanguageTheme(language.name);
  const progress = useLanguageProgress(language.id);

  return (
    <Pressable
      accessibilityLabel={`${language.name}, ${Math.round(progress.data?.percentage ?? 0)}% de avance`}
      accessibilityRole="link"
      onPress={() =>
        router.push({ pathname: "/lenguas/[id]", params: { id: String(language.id) } })
      }
      style={{ alignItems: "center", gap: 3, width: 74 }}
    >
      <Portrait language={look} size={54} ring={3} fallbackLabel={language.name} />
      <T f="display" w={600} s={12.5} lh={15} numberOfLines={1}>
        {language.name}
      </T>
      <T w={700} s={11.5} c={look.ring}>
        {progress.data ? `${Math.round(progress.data.percentage)}%` : "–"}
      </T>
    </Pressable>
  );
}

function MenuCard({
  items,
  onOpen,
  onAction,
}: {
  items: MenuItem[];
  onOpen: (href: Href) => void;
  onAction?: (action: NonNullable<MenuItem["action"]>) => void;
}) {
  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: 18,
        borderWidth: 1,
        marginTop: 12,
        overflow: "hidden",
      }}
    >
      {items.map((item, index) => {
        const disabled = !item.href && !item.action;
        const textColor = item.danger ? theme.colors.danger : theme.colors.ink;
        return (
          <Pressable
            key={item.label}
            accessibilityRole={disabled ? "text" : "link"}
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={() => {
              if (item.action) onAction?.(item.action);
              else if (item.href) onOpen(item.href);
            }}
            style={({ pressed }) => ({
              alignItems: "center",
              borderBottomColor: "#F0E6D3",
              borderBottomWidth: index === items.length - 1 ? 0 : 1,
              flexDirection: "row",
              gap: 12,
              height: 50,
              opacity: pressed ? 0.85 : 1,
              paddingHorizontal: 14,
            })}
          >
            <View
              style={{
                alignItems: "center",
                backgroundColor: item.bg,
                borderRadius: 16,
                height: 32,
                justifyContent: "center",
                width: 32,
              }}
            >
              <Icon name={item.icon} size={18} color={item.color} />
            </View>
            <T w={600} s={14.5} c={textColor} style={{ flex: 1 }}>
              {item.label}
            </T>
            {item.badge ? (
              <View
                style={{
                  backgroundColor: disabled ? theme.colors.track : theme.colors.purpleSoft,
                  borderRadius: 10,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}
              >
                <T w={700} s={11} c={disabled ? theme.colors.muted : theme.colors.purpleDeep}>
                  {item.badge}
                </T>
              </View>
            ) : null}
            {!disabled ? <Icon name="chevronRight" size={18} color="#8A8472" strokeWidth={2} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
