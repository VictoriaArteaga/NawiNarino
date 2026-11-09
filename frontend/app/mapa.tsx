import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { NarinoMap } from "../components/art/NarinoMap";
import { TerritoryThumb } from "../components/art/TerritoryThumb";
import { BackButton } from "../components/CircleButton";
import { ErrorMessage } from "../components/ErrorMessage";
import { useHeaderTop } from "../components/Hero";
import { Icon } from "../components/Icon";
import { Loading } from "../components/Loading";
import { MockBadge } from "../components/MockBadge";
import { ScreenLayout } from "../components/ScreenLayout";
import { T } from "../components/T";
import { shadows, theme } from "../constants/theme";
import { useTerritories } from "../hooks/useTerritories";

const legend = [
  { name: "Awá Pit", color: "#3F8A55" },
  { name: "Inga", color: "#EDB23C" },
  { name: "Nasa Yuwe", color: "#4B8FC7" },
  { name: "Cofán", color: "#8B66BE" },
];

export default function MapScreen() {
  const router = useRouter();
  const query = useTerritories();
  const headerTop = useHeaderTop();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const territories = query.data ?? [];
  const selected = territories.find((t) => t.id === selectedId) ?? territories[0];

  return (
    <ScreenLayout nav="mapa" bottomSpace={12}>
      <View style={{ backgroundColor: "#EFE6CF", height: 520 }}>
        <NarinoMap />

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

        {/* Legend */}
        <View
          style={[
            {
              backgroundColor: "rgba(251,247,238,0.96)",
              borderColor: theme.colors.track,
              borderRadius: 14,
              borderWidth: 1,
              bottom: 22,
              gap: 6,
              left: 14,
              paddingHorizontal: 12,
              paddingVertical: 9,
              position: "absolute",
            },
            shadows.soft,
          ]}
        >
          {legend.map((item) => (
            <View key={item.name} style={{ alignItems: "center", flexDirection: "row", gap: 8 }}>
              <View style={{ backgroundColor: item.color, borderRadius: 6, height: 12, width: 12 }} />
              <T w={700} s={12.5}>
                {item.name}
              </T>
            </View>
          ))}
        </View>

        <View
          style={{
            backgroundColor: "rgba(251,247,238,0.96)",
            borderColor: theme.colors.track,
            borderRadius: 12,
            borderWidth: 1,
            maxWidth: 170,
            paddingHorizontal: 10,
            paddingVertical: 6,
            position: "absolute",
            right: 14,
            top: headerTop + 44,
          }}
        >
          <T w={700} s={11} lh={14} c={theme.colors.muted}>
            Esquema ilustrativo: las zonas no son una distribución validada.
          </T>
        </View>
      </View>

      {/* Selected territory */}
      <View style={{ marginTop: -6, paddingHorizontal: 16 }}>
        {query.isPending ? (
          <Loading label="Cargando territorios de demostración..." />
        ) : query.isError ? (
          <ErrorMessage message={query.error.message} onRetry={() => void query.refetch()} />
        ) : !selected ? (
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: 20,
              borderWidth: 1,
              padding: 16,
            }}
          >
            <T c={theme.colors.muted}>No hay territorios de demostración disponibles.</T>
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
            {territories.length > 1 ? (
              <ScrollView
                contentContainerStyle={{ gap: 8, paddingBottom: 10 }}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {territories.map((territory) => {
                  const active = territory.id === selected.id;
                  return (
                    <Pressable
                      key={territory.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      onPress={() => setSelectedId(territory.id)}
                      style={{
                        alignItems: "center",
                        backgroundColor: active ? theme.colors.primary : "#FFFFFF",
                        borderColor: active ? theme.colors.primary : theme.colors.border,
                        borderRadius: 18,
                        borderWidth: 1.5,
                        flexDirection: "row",
                        gap: 6,
                        height: 36,
                        paddingHorizontal: 12,
                      }}
                    >
                      <Icon name="pin" size={14} color={active ? "#FFFFFF" : theme.colors.primary} />
                      <T f="display" w={600} s={13} c={active ? "#FFFFFF" : theme.colors.ink}>
                        {territory.name}
                      </T>
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : null}
            <View style={{ borderRadius: 12, height: 84, overflow: "hidden" }}>
              <TerritoryThumb preserveAspectRatio="xMidYMid slice" />
            </View>
            <T f="display" w={700} s={17} style={{ marginTop: 10 }}>
              {selected.name}
            </T>
            <T s={13} lh={18} c="#4B554F" style={{ marginTop: 2 }}>
              {selected.region}. {selected.description}
            </T>
            {selected.isMock ? <MockBadge /> : null}
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: "/territorios/[territoryId]",
                  params: { territoryId: String(selected.id) },
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
