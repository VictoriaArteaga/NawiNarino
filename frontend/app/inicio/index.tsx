import { useRouter, type Href } from "expo-router";
import { Pressable, View } from "react-native";

import { Avatar } from "../../components/Avatar";
import { HomeHero } from "../../components/art/HomeHero";
import { CircleButton } from "../../components/CircleButton";
import { GradientBox } from "../../components/GradientBox";
import { Hero, useHeaderTop } from "../../components/Hero";
import { Icon, type IconName } from "../../components/Icon";
import { ScreenLayout } from "../../components/ScreenLayout";
import { T } from "../../components/T";
import { useLanguages } from "../../hooks/useLanguages";
import { useProgress } from "../../hooks/useLearning";
import { useVocabulary } from "../../hooks/useVocabulary";
import { shadows, theme } from "../../constants/theme";

interface FeatureCard {
  href: Href;
  icon: IconName;
  title: [string, string];
  description: string;
  colors: [string, string];
}

const features: FeatureCard[] = [
  {
    href: "/lenguas",
    icon: "book",
    title: ["Aprende", "lenguas"],
    description: "Vocabulario, frases, pronunciación y más.",
    colors: ["#D0643A", "#DA7448"],
  },
  {
    href: "/mapa",
    icon: "map",
    title: ["Explora", "territorio"],
    description: "Mapa, lugares, cultura y patrimonio.",
    colors: ["#436B56", "#5B8872"],
  },
  {
    href: "/explorador",
    icon: "sparkle",
    title: ["Ñawi Explora", "IA + Fuentes"],
    description: "Pregunta, descubre, conoce más.",
    colors: ["#7A4B86", "#8A5A95"],
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const headerTop = useHeaderTop();
  const languages = useLanguages();
  const firstLanguageId = languages.data?.[0]?.id ?? 0;
  const vocabulary = useVocabulary(firstLanguageId);
  const progress = useProgress();
  const wordOfTheDay = vocabulary.data?.[0];

  return (
    <ScreenLayout nav="inicio" band>
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
                paddingHorizontal: 8,
              },
              shadows.float,
            ]}
          >
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
            <View style={{ flex: 1 }}>
              <T f="body" w={700} s={11} lh={13} c={theme.colors.muted} ls={0.3}>
                PALABRA DEL DÍA · DEMO
              </T>
              <T f="display" w={700} s={16} lh={20} numberOfLines={1}>
                {wordOfTheDay ? wordOfTheDay.word : "Próximamente"}
                {wordOfTheDay ? (
                  <T f="display" w={500} s={13} c="#4B554F">
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
      <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
        <T f="display" w={800} s={23} lh={28} c={theme.colors.primaryDark}>
          Explora Nariño
        </T>
        <T s={13.5} lh={18} c={theme.colors.muted}>
          El territorio también se habla.
        </T>

        <View style={{ gap: 10, marginTop: 14 }}>
          {features.map((feature) => (
            <Pressable
              key={feature.title.join(" ")}
              accessibilityLabel={`${feature.title.join(" ")}. ${feature.description}`}
              accessibilityRole="link"
              onPress={() => router.push(feature.href)}
              style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
            >
              <GradientBox
                colors={feature.colors}
                direction="br"
                style={[
                  {
                    alignItems: "center",
                    borderRadius: 18,
                    flexDirection: "row",
                    gap: 14,
                    height: 92,
                    paddingLeft: 16,
                    paddingRight: 18,
                  },
                  shadows.card,
                ]}
              >
                <View
                  style={{
                    alignItems: "center",
                    borderColor: "rgba(255,255,255,0.85)",
                    borderRadius: 26,
                    borderWidth: 2,
                    height: 52,
                    justifyContent: "center",
                    width: 52,
                  }}
                >
                  <Icon name={feature.icon} size={26} color="#FFFFFF" strokeWidth={1.7} />
                </View>
                <View style={{ flex: 1 }}>
                  <T f="display" w={700} s={18} lh={21} c="#FFFFFF">
                    {feature.title[0]}
                    {"\n"}
                    {feature.title[1]}
                  </T>
                  <T s={12} lh={16} c="#FFFFFF" style={{ marginTop: 4, opacity: 0.95 }}>
                    {feature.description}
                  </T>
                </View>
                <Icon name="arrowRight" size={24} color="#FFFFFF" strokeWidth={2.2} />
              </GradientBox>
            </Pressable>
          ))}
        </View>

        {/* Honest notice: this build uses temporary demonstration records. */}
        <View
          style={{
            backgroundColor: theme.colors.mockBackground,
            borderRadius: 16,
            marginTop: 18,
            padding: 14,
          }}
        >
          <T f="display" w={700} s={11.5} ls={0.5} c={theme.colors.mockText}>
            VERSIÓN DE DEMOSTRACIÓN
          </T>
          <T s={13} lh={19} c={theme.colors.mockText} style={{ marginTop: 4 }}>
            Los registros de lengua y cultura son temporales y están pendientes
            de validación con fuentes confiables y orientación de las
            comunidades.
          </T>
        </View>
      </View>
    </ScreenLayout>
  );
}
