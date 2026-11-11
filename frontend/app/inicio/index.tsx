import { useRouter, type Href } from "expo-router";
import { View } from "react-native";
import { Pressable } from "../../components/Pressable";

import { Avatar } from "../../components/Avatar";
import { HomeHero } from "../../components/art/HomeHero";
import { CircleButton } from "../../components/CircleButton";
import { GradientBox } from "../../components/GradientBox";
import { Hero, useHeaderTop } from "../../components/Hero";
import { Icon, type IconName } from "../../components/Icon";
import { Portrait } from "../../components/Portrait";
import { ScreenLayout } from "../../components/ScreenLayout";
import { T } from "../../components/T";
import { getLanguageTheme } from "../../constants/languages";
import { useLanguages } from "../../hooks/useLanguages";
import { useProgress } from "../../hooks/useLearning";
import { useVocabulary } from "../../hooks/useVocabulary";
import { shadows, theme, tone } from "../../constants/theme";

import { useAppearance } from "../../store/settingsStore";
interface FeatureCard {
  href: Href;
  icon: IconName;
  title: string;
  tag?: string;
  description: string;
  colors: [string, string];
}

const learn: FeatureCard = {
  href: "/lenguas",
  icon: "book",
  title: "Aprende lenguas",
  description: "Vocabulario, frases, pronunciación y más.",
  colors: ["#C8461A", "#E0783F"],
};

const tiles: FeatureCard[] = [
  {
    href: "/mapa",
    icon: "map",
    title: "Explora territorio",
    description: "Mapa, lugares, cultura y patrimonio.",
    colors: ["#2F6F4E", "#5B9378"],
  },
  {
    href: "/explorador",
    icon: "sparkle",
    title: "Ñawi Explora",
    tag: "IA + Fuentes",
    description: "Pregunta, descubre, conoce más.",
    colors: ["#6B3F7C", "#9460A3"],
  },
];

const LEARN_LANGUAGES = ["Awá Pit", "Inga", "Nasa Yuwe", "A'ingae"] as const;

/** Círculo translúcido de fondo: da profundidad a las cards sin usar patrones. */
function Glow({ size, top, right }: { size: number; top: number; right: number }) {
  return (
    <View
      pointerEvents="none"
      style={{
        backgroundColor: "rgba(255,255,255,0.13)",
        borderRadius: size / 2,
        height: size,
        position: "absolute",
        right,
        top,
        width: size,
      }}
    />
  );
}

function IconBubble({ name, size = 54 }: { name: IconName; size?: number }) {
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.22)",
        borderColor: "rgba(255,255,255,0.7)",
        borderRadius: size / 2,
        borderWidth: 1.5,
        height: size,
        justifyContent: "center",
        width: size,
      }}
    >
      <Icon name={name} size={size * 0.48} color="#FFFFFF" strokeWidth={1.8} />
    </View>
  );
}

export default function HomeScreen() {
  useAppearance();
  const router = useRouter();
  const headerTop = useHeaderTop();
  const languages = useLanguages();
  const firstLanguageId = languages.data?.[0]?.id ?? 0;
  const vocabulary = useVocabulary(firstLanguageId);
  const progress = useProgress();
  const wordOfTheDay = vocabulary.data?.[0];

  return (
    <ScreenLayout nav="inicio">
      <Hero height={330} art={<HomeHero preserveAspectRatio="xMidYMin slice" />}>
        {/* Brand and quick actions */}
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
            left: 20,
            position: "absolute",
            right: 14,
            top: headerTop,
          }}
        >
          <View>
            <T f="display" w={800} s={31} lh={31} ls={1} c={theme.colors.primaryDark}>
              ÑAWI
            </T>
            <T
              f="display"
              w={500}
              s={10.5}
              ls={5.5}
              c={theme.colors.primaryDark}
              style={{ marginTop: 3 }}
            >
              NARIÑO
            </T>
          </View>
          <View style={{ alignItems: "center", flexDirection: "row", gap: 6 }}>
            <CircleButton
              icon="bell"
              label="Notificaciones"
              onPress={() => undefined}
              background="rgba(251,243,230,0.7)"
              iconSize={23}
            />
            <Pressable
              accessibilityLabel="Mi perfil"
              accessibilityRole="button"
              onPress={() => router.push("/perfil")}
              style={{
                borderColor: theme.colors.surface,
                borderRadius: 22,
                borderWidth: 2,
                height: 44,
                overflow: "hidden",
                width: 44,
              }}
            >
              <Avatar size={40} />
            </Pressable>
          </View>
        </View>

        {/* Greeting */}
        <View style={{ left: 20, position: "absolute", top: headerTop + 68, width: 270 }}>
          <T
            accessibilityRole="header"
            f="display"
            w={800}
            s={27}
            lh={32}
            c={theme.colors.primaryDark}
          >
            ¡Hola, explorador/a!
          </T>
          <T s={14.5} lh={20} c="#33423B" style={{ marginTop: 6 }}>
            Aprende, descubre y conecta con las lenguas y culturas de Nariño.
          </T>
        </View>

        {/* Word of the day + progress */}
        <View
          style={{
            bottom: 16,
            flexDirection: "row",
            gap: 8,
            left: 14,
            position: "absolute",
            right: 14,
          }}
        >
          <View
            style={[
              {
                alignItems: "center",
                backgroundColor: theme.colors.surface,
                borderRadius: 16,
                flex: 1,
                flexDirection: "row",
                gap: 10,
                height: 52,
                paddingLeft: wordOfTheDay?.audioUrl ? 8 : 16,
                paddingRight: 8,
              },
              shadows.float,
            ]}
          >
            {wordOfTheDay?.audioUrl ? (
              <View
                style={{
                  alignItems: "center",
                  backgroundColor: theme.colors.primary,
                  borderRadius: 20,
                  height: 40,
                  justifyContent: "center",
                  width: 40,
                }}
              >
                <Icon name="speaker" size={20} color="#FFFFFF" />
              </View>
            ) : null}
            <View style={{ flex: 1 }}>
              <T f="body" w={700} s={11} lh={13} c={theme.colors.muted} ls={0.3}>
                PALABRA DEL DÍA
              </T>
              <T f="display" w={700} s={16} lh={20} numberOfLines={1}>
                {wordOfTheDay ? wordOfTheDay.word : "Próximamente"}
                {wordOfTheDay ? (
                  <T f="display" w={500} s={13} c={tone("#4B554F")}>
                    {` · ${wordOfTheDay.translation}`}
                  </T>
                ) : null}
              </T>
            </View>
          </View>
          <Pressable
            accessibilityLabel="Ver mi progreso"
            accessibilityRole="button"
            onPress={() => router.push("/progreso")}
            style={[
              {
                alignItems: "center",
                backgroundColor: theme.colors.surface,
                borderRadius: 16,
                flexDirection: "row",
                gap: 6,
                height: 52,
                justifyContent: "center",
                width: 92,
              },
              shadows.float,
            ]}
          >
            <Icon name="flame" size={26} color={theme.colors.accent} fill={theme.colors.accent} />
            <View>
              <T f="display" w={800} s={17} lh={18} c={theme.colors.accent}>
                {progress.data ? progress.data.completedActivities : "–"}
              </T>
              <T w={600} s={10.5} lh={12} c={theme.colors.muted}>
                actividades
              </T>
            </View>
          </Pressable>
        </View>
      </Hero>

      {/* Explora Nariño */}
      <View style={{ paddingHorizontal: 20, paddingTop: 6 }}>
        <T f="display" w={800} s={23} lh={28} c={theme.colors.heading}>
          Explora Nariño
        </T>
        <T s={13.5} lh={18} c={theme.colors.muted}>
          El territorio también se habla.
        </T>

        <View style={{ gap: 10, marginTop: 14 }}>
          {/* Aprende lenguas: la acción principal */}
          <Pressable
            accessibilityLabel={`${learn.title}. ${learn.description}`}
            accessibilityRole="link"
            onPress={() => router.push(learn.href)}
            style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
          >
            <GradientBox
              colors={learn.colors}
              direction="br"
              style={[{ borderRadius: 24, overflow: "hidden", padding: 18 }, shadows.card]}
            >
              <Glow size={170} top={-60} right={-40} />
              <Glow size={90} top={70} right={60} />
              <View style={{ alignItems: "center", flexDirection: "row", gap: 14 }}>
                <IconBubble name={learn.icon} size={58} />
                <View style={{ flex: 1 }}>
                  <T f="display" w={800} s={23} lh={27} c="#FFFFFF">
                    {learn.title}
                  </T>
                  <T s={13} lh={18} c="#FFFFFF" style={{ marginTop: 2, opacity: 0.95 }}>
                    {learn.description}
                  </T>
                </View>
              </View>
              <View
                style={{
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 14,
                }}
              >
                <View style={{ alignItems: "center", flexDirection: "row", gap: 10 }}>
                  <View style={{ flexDirection: "row" }}>
                    {LEARN_LANGUAGES.map((name, index) => (
                      <View key={name} style={{ marginLeft: index === 0 ? 0 : -9 }}>
                        <Portrait
                          language={getLanguageTheme(name)}
                          size={34}
                          ring={2.5}
                          accessibilityLabel={`Retrato del pueblo ${name}`}
                        />
                      </View>
                    ))}
                  </View>
                  <T f="display" w={700} s={13} c="#FFFFFF">
                    {languages.data ? `${languages.data.length} lenguas` : "Lenguas"}
                  </T>
                </View>
                <View
                  style={{
                    alignItems: "center",
                    backgroundColor: "#FFFFFF",
                    borderRadius: 20,
                    flexDirection: "row",
                    gap: 6,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                  }}
                >
                  <T f="display" w={700} s={13.5} c={theme.colors.accent}>
                    Empezar
                  </T>
                  <Icon name="arrowRight" size={16} color={theme.colors.accent} strokeWidth={2.6} />
                </View>
              </View>
            </GradientBox>
          </Pressable>

          {/* Territorio y Ñawi Explora: una tarjeta por fila, a todo el ancho */}
          {tiles.map((tile) => (
            <Pressable
              key={tile.title}
              accessibilityLabel={`${tile.title}. ${tile.description}`}
              accessibilityRole="link"
              onPress={() => router.push(tile.href)}
              style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
            >
              <GradientBox
                colors={tile.colors}
                direction="br"
                style={[
                  {
                    alignItems: "center",
                    borderRadius: 22,
                    flexDirection: "row",
                    minHeight: 98,
                    overflow: "hidden",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                  },
                  shadows.card,
                ]}
              >
                <Glow size={130} top={-50} right={-30} />
                <View style={{ marginRight: 14 }}>
                  <IconBubble name={tile.icon} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  {tile.tag ? (
                    <View
                      style={{
                        alignSelf: "flex-start",
                        backgroundColor: "rgba(255,255,255,0.22)",
                        borderRadius: 10,
                        marginBottom: 4,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                      }}
                    >
                      <T f="display" w={700} s={10.5} ls={0.3} c="#FFFFFF">
                        {tile.tag}
                      </T>
                    </View>
                  ) : null}
                  <T f="display" w={800} s={19} lh={23} c="#FFFFFF">
                    {tile.title}
                  </T>
                  <T s={12.5} lh={17} c="#FFFFFF" style={{ marginTop: 2, opacity: 0.95 }}>
                    {tile.description}
                  </T>
                </View>
                <View
                  style={{
                    alignItems: "center",
                    backgroundColor: "#FFFFFF",
                    borderRadius: 17,
                    height: 34,
                    justifyContent: "center",
                    marginLeft: 10,
                    width: 34,
                  }}
                >
                  <Icon name="arrowRight" size={18} color={tile.colors[0]} strokeWidth={2.6} />
                </View>
              </GradientBox>
            </Pressable>
          ))}
        </View>
      </View>
    </ScreenLayout>
  );
}
