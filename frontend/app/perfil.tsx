import { useRouter, type Href } from "expo-router";
import { View } from "react-native";
import { Pressable } from "../components/Pressable";

import { ProfileHero } from "../components/art/ProfileHero";
import { Avatar } from "../components/Avatar";
import { BackButton, CircleButton } from "../components/CircleButton";
import { GradientBox } from "../components/GradientBox";
import { Hero, useHeaderTop } from "../components/Hero";
import { Icon, type IconName } from "../components/Icon";
import { PatternBand } from "../components/PatternBand";
import { Portrait } from "../components/Portrait";
import { ScreenLayout } from "../components/ScreenLayout";
import { T } from "../components/T";
import { getLanguageTheme, sortLanguages } from "../constants/languages";
import { shadows, theme, tone } from "../constants/theme";
import { useLogout } from "../hooks/useAuth";
import { useLanguages } from "../hooks/useLanguages";
import { useLanguageProgress, useProgress } from "../hooks/useLearning";
import { useAppStore } from "../store/appStore";
import { useAuthStore } from "../store/authStore";
import type { Language } from "../types/language";

import { useAppearance } from "../store/settingsStore";
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
  useAppearance();
  const router = useRouter();
  const headerTop = useHeaderTop();
  const languages = useLanguages();
  const progress = useProgress();
  const savedCount = useAppStore((s) => s.savedLanguageIds.length);
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  const learnItems: MenuItem[] = [
    { label: "Mi progreso", icon: "chart", bg: tone("#E4EFE6"), color: "#2F6F4E", href: "/progreso" },
    {
      label: "Lenguas guardadas",
      icon: "bookmark",
      bg: tone("#E6DDF3"),
      color: tone("#6B4A9E"),
      href: "/lenguas",
      badge: savedCount > 0 ? String(savedCount) : undefined,
    },
  ];
  const accountItems: MenuItem[] = [
    { label: "Ajustes", icon: "gear", bg: tone("#DCEAF6"), color: "#2E6FA8", href: "/ajustes" },
    { label: "Cerrar sesión", icon: "logout", bg: tone("#FBE4E1"), color: "#C0392B", danger: true, action: "logout" },
  ];

  return (
    <View style={{ flex: 1 }}>
    <ScreenLayout bottomSpace={theme.layout.bandHeight + 16}>
      <Hero height={190} art={<ProfileHero preserveAspectRatio="xMidYMin slice" />}>
        <View style={{ left: 14, position: "absolute", top: headerTop }}>
          <BackButton fallback="/inicio" />
        </View>
        <View style={{ left: 68, position: "absolute", top: headerTop + 4 }}>
          <T accessibilityRole="header" f="display" w={800} s={23} lh={28} c={theme.colors.primaryDark}>
            Perfil
          </T>
        </View>
        <View style={{ position: "absolute", right: 14, top: headerTop }}>
          <CircleButton icon="gear" label="Ajustes" onPress={() => router.push("/ajustes")} iconSize={22} />
        </View>
      </Hero>

      {/* Identity */}
      <View style={{ alignItems: "center", marginTop: -58 }}>
        <View style={{ height: 96, width: 96 }}>
          <Avatar size={96} ring progress={progress.data?.percentage ?? 0} />
          <Pressable
            accessibilityLabel="Editar perfil"
            accessibilityRole="button"
            onPress={() => router.push("/ajustes")}
            style={({ pressed }) => [
              {
                alignItems: "center",
                backgroundColor: theme.colors.accent,
                borderColor: theme.colors.canvas,
                borderRadius: 17,
                borderWidth: 2,
                bottom: 0,
                height: 34,
                justifyContent: "center",
                opacity: pressed ? 0.85 : 1,
                position: "absolute",
                right: -4,
                width: 34,
              },
              shadows.soft,
            ]}
          >
            <Icon name="edit" size={16} color="#FFFFFF" strokeWidth={2.2} />
          </Pressable>
        </View>
        <T f="display" w={800} s={22} lh={27} c={theme.colors.ink} style={{ marginTop: 8 }}>
          {user?.name ?? "Explorador/a Ñawi"}
        </T>
        <T s={13.5} c={theme.colors.muted}>
          {user?.email ?? "Sin sesión iniciada"}
        </T>
        <View style={{ alignItems: "center", flexDirection: "row", gap: 8, marginTop: 12 }}>
          <Chip bg={theme.colors.gold} color="#2B1D05" icon="star" label={`${Math.round(progress.data?.percentage ?? 0)}% total`} />
          <Chip bg={tone("#FBE3D6")} color={theme.colors.accent} icon="flame" label={`${progress.data?.completedActivities ?? 0} actividades`} />
          <Chip bg={tone("#E4EFE6")} color={tone("#1F5C3A")} label={`${savedCount} guardadas`} />
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
            <T f="display" w={700} s={16} c={theme.colors.heading}>
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

    </ScreenLayout>
    {/* La franja de patrón queda pegada al borde inferior, como en el diseño. */}
    <View pointerEvents="none" style={{ bottom: 0, left: 0, position: "absolute", right: 0 }}>
      <PatternBand />
    </View>
    </View>
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
      {items.map((item, index) => (
        <MenuRow
          key={item.label}
          item={item}
          last={index === items.length - 1}
          onPress={() => {
            if (item.action) onAction?.(item.action);
            else if (item.href) onOpen(item.href);
          }}
        />
      ))}
    </View>
  );
}

/**
 * Fila del menú: mosaico de color con el ícono a la izquierda, el texto a su lado y una flecha a la derecha.
 * La disposición usa vistas con márgenes explícitos (sin `gap` ni estilos en función) para que se vea igual
 * en todos los celulares.
 */
function MenuRow({ item, last, onPress }: { item: MenuItem; last: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityLabel={item.label} accessibilityRole="button" onPress={onPress}>
      {({ pressed }) => (
        <View style={{ opacity: pressed ? 0.8 : 1 }}>
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              minHeight: 64,
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}
          >
            <GradientBox
              colors={[item.color, item.color]}
              direction="br"
              style={{
                alignItems: "center",
                borderRadius: 13,
                height: 42,
                justifyContent: "center",
                marginRight: 14,
                width: 42,
              }}
            >
              <Icon name={item.icon} size={22} color="#FFFFFF" strokeWidth={2} />
            </GradientBox>
            <View style={{ flex: 1, minWidth: 0 }}>
              <T f="display" w={700} s={15.5} c={item.danger ? theme.colors.danger : theme.colors.ink} numberOfLines={1}>
                {item.label}
              </T>
            </View>
            {item.badge ? (
              <View
                style={{
                  backgroundColor: theme.colors.purpleSoft,
                  borderRadius: 10,
                  marginRight: 8,
                  paddingHorizontal: 9,
                  paddingVertical: 2,
                }}
              >
                <T w={700} s={11.5} c={theme.colors.purpleDeep}>
                  {item.badge}
                </T>
              </View>
            ) : null}
            <Icon name="chevronRight" size={20} color={tone("#8A8472")} strokeWidth={2.2} />
          </View>
          {!last ? <View style={{ backgroundColor: theme.colors.border, height: 1, marginLeft: 70 }} /> : null}
        </View>
      )}
    </Pressable>
  );
}
