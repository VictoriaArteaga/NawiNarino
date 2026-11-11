import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { Pressable } from "../components/Pressable";

import { NarinoMap } from "../components/art/NarinoMap";
import { SceneArt } from "../components/art/SceneArt";
import type { SceneKey } from "../components/art/placeScenes";
import {
  askAbout,
  OTHER_COLORS,
  peopleByKey,
  peopleForTerritory,
  peopleZones,
  type PeopleKey,
} from "../components/art/peopleZones";
import { BackButton } from "../components/CircleButton";
import { ErrorMessage } from "../components/ErrorMessage";
import { useHeaderTop } from "../components/Hero";
import { Icon } from "../components/Icon";
import { Loading } from "../components/Loading";
import { Portrait } from "../components/Portrait";
import { ScreenLayout } from "../components/ScreenLayout";
import { T } from "../components/T";
import { getLanguageTheme } from "../constants/languages";
import { shadows, theme, tone } from "../constants/theme";
import { useTerritories } from "../hooks/useTerritories";
import type { Territory } from "../types/territory";

import { useAppearance } from "../store/settingsStore";
/** Ilustración que representa a cada pueblo. */
const peopleScene: Record<PeopleKey, { scene: SceneKey; alt: string }> = {
  awa: { scene: "selva", alt: "Ilustración de la selva húmeda del pueblo Awá" },
  pasto: { scene: "cumbal", alt: "Ilustración del volcán Cumbal en el territorio del pueblo Pasto" },
  quillacinga: { scene: "encano", alt: "Ilustración de la laguna y el bosque del pueblo Quillacinga" },
  inga: { scene: "valle", alt: "Ilustración del valle de Sibundoy del pueblo Inga" },
  aingae: { scene: "rio", alt: "Ilustración de un río de la Amazonía, territorio del pueblo A'ingae" },
  nasa: { scene: "tierradentro", alt: "Ilustración de las montañas de Tierradentro, territorio del pueblo Nasa" },
};

/** Nombre del tema de retrato (solo existe para las cuatro lenguas ilustradas). */
const portraitName: Partial<Record<PeopleKey, string>> = {
  awa: "Awá Pit",
  inga: "Inga",
  aingae: "A'ingae",
  nasa: "Nasa Yuwe",
};

interface Entry {
  territory: Territory;
  key: PeopleKey;
}

export default function MapScreen() {
  useAppearance();
  const router = useRouter();
  const query = useTerritories();
  const headerTop = useHeaderTop();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Cada territorio se asocia con su pueblo y se ordena como la leyenda.
  const order = peopleZones.map((p) => p.key);
  const entries: Entry[] = (query.data ?? [])
    .map((territory) => ({ territory, key: peopleForTerritory(territory.name) }))
    .filter((entry): entry is Entry => entry.key !== undefined)
    .sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));

  const selected = entries.find((e) => e.territory.id === selectedId) ?? entries[0];
  const people = selected ? peopleByKey(selected.key) : undefined;
  const portrait = selected ? portraitName[selected.key] : undefined;

  return (
    <ScreenLayout nav="mapa" bottomSpace={12}>
      <View style={{ backgroundColor: "#EFE6CF", height: 520 }}>
        <NarinoMap
          selected={selected?.key}
          onSelect={(key) => {
            const hit = entries.find((entry) => entry.key === key);
            if (hit) setSelectedId(hit.territory.id);
          }}
        />

        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            gap: 6,
            left: 8,
            position: "absolute",
            top: headerTop - 6,
          }}
        >
          <BackButton fallback="/inicio" background="transparent" />
          <T accessibilityRole="header" f="display" w={700} s={22} c={theme.colors.primaryDark}>
            Mapa lingüístico
          </T>
        </View>

        {/* Leyenda: un color por pueblo y arena para las demás comunidades */}
        <View
          style={[
            {
              backgroundColor: tone("rgba(251,247,238,0.96)"),
              borderColor: theme.colors.track,
              borderRadius: 14,
              borderWidth: 1,
              bottom: 22,
              columnGap: 14,
              flexDirection: "row",
              flexWrap: "wrap",
              left: 14,
              paddingHorizontal: 12,
              paddingVertical: 9,
              position: "absolute",
              rowGap: 6,
              width: 236,
            },
            shadows.soft,
          ]}
        >
          {peopleZones.map((item) => (
            <View key={item.key} style={{ alignItems: "center", flexDirection: "row", width: 96 }}>
              <View style={{ backgroundColor: item.color, borderRadius: 6, height: 12, marginRight: 8, width: 12 }} />
              <T w={700} s={12.5}>
                {item.label}
              </T>
            </View>
          ))}
          <View style={{ alignItems: "center", flexDirection: "row", width: 210 }}>
            <View
              style={{
                backgroundColor: OTHER_COLORS[1],
                borderColor: "#B9AD8D",
                borderRadius: 6,
                borderWidth: 1,
                height: 12,
                marginRight: 8,
                width: 12,
              }}
            />
            <T w={700} s={12.5}>
              Otras comunidades
            </T>
          </View>
        </View>

        {/* Botón de ubicación: Ñawi cuenta sobre el territorio elegido */}
        {selected ? (
          <View style={{ alignItems: "center", flexDirection: "row", position: "absolute", right: 14, top: 128 }}>
            <View
              style={[
                {
                  backgroundColor: "rgba(251,247,238,0.96)",
                  borderColor: "#B9A5DB",
                  borderRadius: 14,
                  borderWidth: 1,
                  marginRight: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                },
                shadows.soft,
              ]}
            >
              <T f="display" w={700} s={11.5} c="#4A2F78">
                Pregúntale a Ñawi
              </T>
            </View>
            <Pressable
              accessibilityHint="Abre la conversación con Ñawi con información de este territorio"
              accessibilityLabel={`Ubicación: Ñawi te cuenta sobre el territorio de ${people?.label ?? ""}`}
              accessibilityRole="button"
              onPress={() => {
                const about = askAbout[selected.key];
                router.push({
                  pathname: "/explorador/conversacion",
                  params: { q: about.query, label: about.label },
                });
              }}
              style={[
                {
                  alignItems: "center",
                  backgroundColor: "#FBF7EE",
                  borderColor: "#B9A5DB",
                  borderRadius: 26,
                  borderWidth: 2,
                  height: 52,
                  justifyContent: "center",
                  width: 52,
                },
                shadows.float,
              ]}
            >
              <Icon name="locate" size={26} color="#1F4D3A" strokeWidth={2} />
              <View
                style={{
                  alignItems: "center",
                  backgroundColor: "#6B4A9E",
                  borderColor: "#FFFFFF",
                  borderRadius: 10,
                  borderWidth: 2,
                  height: 20,
                  justifyContent: "center",
                  position: "absolute",
                  right: -4,
                  top: -4,
                  width: 20,
                }}
              >
                <Icon name="sparkle" size={11} color="#FFFFFF" strokeWidth={1.8} />
              </View>
            </Pressable>
          </View>
        ) : null}
      </View>

      {/* Pueblo seleccionado */}
      <View style={{ marginTop: -6, paddingHorizontal: 16 }}>
        {query.isPending ? (
          <Loading label="Cargando territorios..." />
        ) : query.isError ? (
          <ErrorMessage message={query.error.message} onRetry={() => void query.refetch()} />
        ) : !selected || !people ? (
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: 20,
              borderWidth: 1,
              padding: 16,
            }}
          >
            <T c={theme.colors.muted}>No hay territorios disponibles.</T>
          </View>
        ) : (
          <View
            style={[
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: 20,
                borderWidth: 1,
                padding: 12,
              },
              shadows.float,
            ]}
          >
            <ScrollView
              contentContainerStyle={{ gap: 8, paddingBottom: 10 }}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {entries.map(({ territory, key }) => {
                const active = territory.id === selected.territory.id;
                const zone = peopleByKey(key);
                return (
                  <Pressable
                    key={territory.id}
                    accessibilityLabel={`Ver el territorio de ${zone.label}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setSelectedId(territory.id)}
                    style={{
                      alignItems: "center",
                      backgroundColor: active ? zone.color : tone("#FFFFFF"),
                      borderColor: zone.color,
                      borderRadius: 18,
                      borderWidth: 1.5,
                      flexDirection: "row",
                      gap: 6,
                      height: 36,
                      paddingHorizontal: 12,
                    }}
                  >
                    {!active ? (
                      <View style={{ backgroundColor: zone.color, borderRadius: 5, height: 10, width: 10 }} />
                    ) : null}
                    <T f="display" w={600} s={13} c={active ? "#FFFFFF" : theme.colors.ink}>
                      {zone.label}
                    </T>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Imagen representativa del pueblo */}
            <View style={{ borderRadius: 12, height: 104, overflow: "hidden" }}>
              <SceneArt
                scene={peopleScene[selected.key].scene}
                accessibilityLabel={peopleScene[selected.key].alt}
              />
            </View>
            {portrait ? (
              <View style={{ marginLeft: 10, marginTop: -30 }}>
                <Portrait
                  language={getLanguageTheme(portrait)}
                  size={60}
                  ring={3}
                  ringColor="#FFFFFF"
                  accessibilityLabel={`Retrato del pueblo ${people.label}`}
                />
              </View>
            ) : null}

            <T f="display" w={700} s={17} style={{ marginTop: portrait ? 6 : 10 }}>
              {selected.territory.name}
            </T>
            <T s={13} lh={18} c={tone("#4B554F")} style={{ marginTop: 2 }}>
              {selected.territory.region}. {selected.territory.description}
            </T>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: "/territorios/[territoryId]",
                  params: { territoryId: String(selected.territory.id) },
                })
              }
              style={({ pressed }) => ({
                alignItems: "center",
                backgroundColor: theme.colors.accent,
                borderRadius: 12,
                flexDirection: "row",
                gap: 8,
                height: 44,
                justifyContent: "center",
                marginTop: 10,
                opacity: pressed ? 0.88 : 1,
              })}
            >
              <T f="display" w={600} s={15} c="#FFFFFF">
                Ver contenido
              </T>
              <Icon name="arrowRight" size={17} color="#FFFFFF" strokeWidth={2.2} />
            </Pressable>
          </View>
        )}
      </View>
    </ScreenLayout>
  );
}
