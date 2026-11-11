import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Pressable } from "../../components/Pressable";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { ExploreHero } from "../../components/art/ExploreHero";
import { SceneArt } from "../../components/art/SceneArt";
import type { SceneKey } from "../../components/art/placeScenes";
import { BackButton } from "../../components/CircleButton";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Hero, useHeaderTop } from "../../components/Hero";
import { Icon, type IconName } from "../../components/Icon";
import { Loading } from "../../components/Loading";
import { ScreenLayout } from "../../components/ScreenLayout";
import { T } from "../../components/T";
import { shadows, theme, tone } from "../../constants/theme";
import { useHeritage } from "../../hooks/useHeritage";
import { useTerritories } from "../../hooks/useTerritories";
import type { HeritageCategory } from "../../types/heritage";

import { useAppearance } from "../../store/settingsStore";
type Tab = "Lugares" | "Cultura" | "Patrimonio";

const tabs: { label: Tab; icon: IconName }[] = [
  { label: "Lugares", icon: "pin" },
  { label: "Cultura", icon: "award" },
  { label: "Patrimonio", icon: "landmark" },
];

interface ExploreItem {
  key: string;
  title: string;
  subtitle: string;
  tag: string;
  scene: SceneKey;
  href: Href;
  alt: string;
}

/** Qué pestañas muestran cada categoría (como en el diseño, Cultura y Patrimonio comparten registros). */
const tabCategories: Record<Exclude<Tab, "Lugares">, HeritageCategory[]> = {
  Cultura: ["cultural", "linguistic"],
  Patrimonio: ["historical", "toponymy", "cultural"],
};

function heritageTag(category: HeritageCategory): string {
  switch (category) {
    case "cultural":
      return "Cultura · Patrimonio";
    case "linguistic":
      return "Cultura";
    default:
      return "Patrimonio";
  }
}

/** Ilustración por categoría cuando ningún tema concreto coincide. */
const fallbackScenes: Record<HeritageCategory, SceneKey> = {
  historical: "lajas",
  linguistic: "barniz",
  cultural: "carnaval",
  toponymy: "cocha",
};

/** Cada ilustración se elige por el contenido del registro, no por su posición en la lista. */
const territoryScenes: [RegExp, SceneKey][] = [
  [/awá/i, "selva"],
  [/sibundoy|inga/i, "valle"],
  [/a['’]?ingae|putumayo/i, "rio"],
  [/nasa|tierradentro|cauca/i, "tierradentro"],
  [/quillacinga/i, "encano"],
  [/pasto/i, "cumbal"],
];

const heritageScenesByTopic: [RegExp, SceneKey][] = [
  [/higra|canasto|tejido/i, "tejido"],
  [/hijos del sol/i, "sol"],
  [/luna|lunar/i, "luna"],
  [/numeraci[oó]n|cuerdas/i, "quipu"],
  [/numerales|a['’]?ingae/i, "rio"],
  [/rastros|quillacinga/i, "encano"],
];

const placeFallbacks: SceneKey[] = ["cocha", "cumbal", "encano", "lajas"];

const sceneAlt: Record<SceneKey, string> = {
  cocha: "Ilustración de una laguna rodeada de montañas",
  lajas: "Ilustración de un santuario sobre un cañón con un puente",
  encano: "Ilustración de un bosque nublado junto a una laguna",
  cumbal: "Ilustración de un volcán nevado con páramo y una laguna",
  carnaval: "Ilustración de una máscara mitad negra y mitad blanca",
  barniz: "Ilustración de un cuenco con motivos florales",
  selva: "Ilustración de la selva húmeda con un río y palmas",
  valle: "Ilustración de un valle andino con cultivos y una casa",
  rio: "Ilustración de un río grande al atardecer con una canoa",
  tierradentro: "Ilustración de montañas con terrazas de cultivo",
  sol: "Ilustración de un sol grande sobre las colinas",
  luna: "Ilustración de la luna sobre montañas de noche",
  tejido: "Ilustración de un tejido con rombos de colores",
  quipu: "Ilustración de cuerdas de colores con nudos",
};

function pickScene(text: string, rules: [RegExp, SceneKey][]): SceneKey | undefined {
  return rules.find(([pattern]) => pattern.test(text))?.[1];
}

export default function ExploreScreen() {
  useAppearance();
  const router = useRouter();
  const headerTop = useHeaderTop();
  const [tab, setTab] = useState<Tab>("Lugares");
  const territories = useTerritories();
  const heritage = useHeritage();

  const query = tab === "Lugares" ? territories : heritage;

  let items: ExploreItem[] = [];
  if (tab === "Lugares") {
    const priority = (name: string) => {
      const at = territoryScenes.findIndex(([pattern]) => pattern.test(name));
      return at === -1 ? territoryScenes.length : at;
    };
    const ordered = [...(territories.data ?? [])].sort((a, b) => priority(a.name) - priority(b.name));
    items = ordered.map((territory, index) => {
      const scene =
        pickScene(territory.name, territoryScenes) ?? placeFallbacks[index % placeFallbacks.length];
      return {
        key: `t${territory.id}`,
        title: territory.name,
        subtitle: territory.region,
        tag: "Lugar",
        scene,
        href: {
          pathname: "/territorios/[territoryId]",
          params: { territoryId: String(territory.id) },
        },
        alt: sceneAlt[scene],
      };
    });
  } else {
    const regionById = new Map((territories.data ?? []).map((t) => [t.id, t.region]));
    items = (heritage.data ?? [])
      .filter((record) => tabCategories[tab].includes(record.category))
      .map((record) => {
        const scene = pickScene(record.title, heritageScenesByTopic) ?? fallbackScenes[record.category];
        return {
          key: `h${record.id}`,
          title: record.title,
          subtitle:
            (record.territoryId ? regionById.get(record.territoryId) : undefined) ??
            record.dateLabel ??
            "Nariño",
          tag: heritageTag(record.category),
          scene,
          href: {
            pathname: "/patrimonio/[heritageId]",
            params: { heritageId: String(record.id) },
          },
          alt: sceneAlt[scene],
        };
      });
  }

  const featured = items[0];
  const rows = items.slice(1);

  return (
    <ScreenLayout nav="explorar" band>
      <Hero height={150} art={<ExploreHero preserveAspectRatio="xMidYMin slice" />}>
        <View style={{ left: 14, position: "absolute", top: headerTop }}>
          <BackButton fallback="/inicio" />
        </View>
        <View style={{ left: 68, position: "absolute", top: headerTop + 4 }}>
          <T accessibilityRole="header" f="display" w={800} s={26} lh={30} c={theme.colors.primaryDark}>
            Explorar
          </T>
        </View>
        <T
          s={14}
          lh={19}
          c="#33423B"
          style={{ left: 24, position: "absolute", top: headerTop + 49, width: 230 }}
        >
          Lugares, cultura y patrimonio de Nariño.
        </T>
      </Hero>

      {/* Tabs */}
      <View style={{ flexDirection: "row", gap: 8, marginTop: -12, paddingHorizontal: 20 }}>
        {tabs.map(({ label, icon }) => {
          const active = tab === label;
          return (
            <Pressable
              key={label}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setTab(label)}
              style={{
                alignItems: "center",
                backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                borderColor: active ? theme.colors.primary : theme.colors.border,
                borderRadius: 22,
                borderWidth: 1.5,
                flex: 1,
                flexDirection: "row",
                gap: 6,
                height: 44,
                justifyContent: "center",
              }}
            >
              <Icon name={icon} size={16} color={active ? "#FFFFFF" : theme.colors.ink} />
              <T f="display" w={600} s={14} c={active ? "#FFFFFF" : theme.colors.ink}>
                {label}
              </T>
            </Pressable>
          );
        })}
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
        {query.isPending ? (
          <Loading label="Cargando registros..." />
        ) : query.isError ? (
          <ErrorMessage message={query.error.message} onRetry={() => void query.refetch()} />
        ) : !featured ? (
          <View
            style={{
              alignItems: "center",
              backgroundColor: theme.colors.surface,
              borderColor: tone("#D9CBB0"),
              borderRadius: 18,
              borderStyle: "dashed",
              borderWidth: 1,
              padding: 24,
            }}
          >
            <T f="display" w={700} s={16} c={theme.colors.heading}>
              Aún no hay registros en esta categoría
            </T>
            <T s={13} c={theme.colors.muted} align="center" style={{ marginTop: 4 }}>
              Prueba con otra pestaña.
            </T>
          </View>
        ) : (
          <>
            {/* Featured */}
            <Pressable
              accessibilityLabel={`${featured.title}. ${featured.subtitle}`}
              accessibilityRole="link"
              onPress={() => router.push(featured.href)}
              style={({ pressed }) => [
                { borderRadius: 22, height: 190, opacity: pressed ? 0.92 : 1, overflow: "hidden" },
                shadows.card,
              ]}
            >
              <SceneArt scene={featured.scene} accessibilityLabel={featured.alt} />
              <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
                <Defs>
                  <LinearGradient id="ft" x1="0" y1="1" x2="0" y2="0">
                    <Stop offset="0" stopColor="#14201A" stopOpacity="0.78" />
                    <Stop offset="0.62" stopColor="#14201A" stopOpacity="0" />
                  </LinearGradient>
                </Defs>
                <Rect width="100%" height="100%" fill="url(#ft)" />
              </Svg>
              <View style={{ bottom: 14, left: 16, position: "absolute", right: 64 }}>
                <View
                  style={{
                    alignSelf: "flex-start",
                    backgroundColor: theme.colors.gold,
                    borderRadius: 11,
                    height: 22,
                    justifyContent: "center",
                    paddingHorizontal: 10,
                  }}
                >
                  <T f="display" w={700} s={11.5} c="#2B1D05">
                    Destacado
                  </T>
                </View>
                <T
                  f="display"
                  w={800}
                  s={23}
                  lh={28}
                  c="#FFFFFF"
                  numberOfLines={2}
                  style={{ marginTop: 6, textShadowColor: "rgba(0,0,0,0.35)", textShadowOffset: { height: 1, width: 0 }, textShadowRadius: 4 }}
                >
                  {featured.title}
                </T>
                <View style={{ alignItems: "center", flexDirection: "row", gap: 5, marginTop: 1 }}>
                  <Icon name="pinFilled" size={15} color="#FFFFFF" fill="#FFFFFF" strokeWidth={0} />
                  <T s={13} c="#FFFFFF" numberOfLines={1} style={{ flexShrink: 1 }}>
                    {featured.subtitle}
                  </T>
                </View>
              </View>
              <View
                style={{
                  alignItems: "center",
                  backgroundColor: theme.colors.surface,
                  borderRadius: 20,
                  bottom: 14,
                  height: 40,
                  justifyContent: "center",
                  position: "absolute",
                  right: 14,
                  width: 40,
                }}
              >
                <Icon name="arrowRight" size={20} color={theme.colors.accent} strokeWidth={2.4} />
              </View>
            </Pressable>

            {/* Rows */}
            <View style={{ gap: 10, marginTop: 14 }}>
              {rows.map((row) => (
                <Pressable
                  key={row.key}
                  accessibilityLabel={`${row.title}. ${row.subtitle}`}
                  accessibilityRole="link"
                  onPress={() => router.push(row.href)}
                  style={({ pressed }) => ({
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    borderRadius: 18,
                    borderWidth: 1,
                    flexDirection: "row",
                    height: 88,
                    opacity: pressed ? 0.92 : 1,
                    overflow: "hidden",
                  })}
                >
                  <View style={{ height: 86, width: 104 }}>
                    <SceneArt scene={row.scene} accessibilityLabel={row.alt} />
                  </View>
                  <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 14 }}>
                    <T f="display" w={700} s={16} lh={19} numberOfLines={2}>
                      {row.title}
                    </T>
                    <View style={{ alignItems: "center", flexDirection: "row", gap: 4, marginTop: 3 }}>
                      <Icon name="pinFilled" size={14} color={theme.colors.primary} fill={theme.colors.primary} strokeWidth={0} />
                      <T s={12.5} c={theme.colors.muted} numberOfLines={1} style={{ flexShrink: 1 }}>
                        {row.subtitle}
                      </T>
                    </View>
                    <View
                      style={{
                        alignSelf: "flex-start",
                        backgroundColor: theme.colors.softGreen,
                        borderRadius: 10,
                        marginTop: 5,
                        paddingHorizontal: 8,
                        paddingVertical: 1,
                      }}
                    >
                      <T w={700} s={11} c={tone("#1F5C3A")}>
                        {row.tag}
                      </T>
                    </View>
                  </View>
                  <View style={{ alignItems: "center", justifyContent: "center", paddingRight: 12 }}>
                    <Icon name="chevronRight" size={20} color={theme.colors.muted} strokeWidth={2} />
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* More to explore */}
        <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
          <MoreLink label="Topónimos" onPress={() => router.push("/toponimos")} />
          <MoreLink label="Fuentes" onPress={() => router.push("/fuentes")} />
        </View>
      </View>
    </ScreenLayout>
  );
}

function MoreLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: 14,
        borderWidth: 1,
        flex: 1,
        flexDirection: "row",
        gap: 8,
        height: 46,
        justifyContent: "center",
      }}
    >
      <T f="display" w={600} s={14} c={theme.colors.heading}>
        {label}
      </T>
      <Icon name="arrowRight" size={16} color={theme.colors.accent} strokeWidth={2.2} />
    </Pressable>
  );
}
