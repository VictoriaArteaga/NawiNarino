import { useRouter } from "expo-router";
import { useState } from "react";
import { TextInput, View } from "react-native";
import { Pressable } from "../../components/Pressable";

import { Card } from "../../components/Card";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Icon } from "../../components/Icon";
import { InfoCard } from "../../components/InfoCard";
import { Loading } from "../../components/Loading";
import { PlainScreen } from "../../components/PlainScreen";
import { T } from "../../components/T";
import { fontFamily, theme, tone } from "../../constants/theme";
import { useToponyms } from "../../hooks/useHeritage";

import { useAppearance } from "../../store/settingsStore";
import { useTr } from "../../i18n";
export default function ToponymsScreen() {
  useAppearance();
  const tr = useTr();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const query = useToponyms(search.trim() || undefined);

  return (
    <PlainScreen
      title="Topónimos"
      subtitle="Nombres de lugares y sus significados."
      backHref="/patrimonio"
      backLabel="Explorar"
    >
      <View
        style={{
          alignItems: "center",
          backgroundColor: tone("#FFFFFF"),
          borderColor: tone("#CFE0D2"),
          borderRadius: 26,
          borderWidth: 2,
          flexDirection: "row",
          gap: 10,
          height: 52,
          marginBottom: theme.spacing.lg - 4,
          paddingHorizontal: 14,
        }}
      >
        <Icon name="search" size={20} color={theme.colors.primary} strokeWidth={2} />
        <TextInput
          accessibilityLabel="Buscar nombres de lugares"
          onChangeText={setSearch}
          placeholder={tr("Buscar nombres de lugares")}
          placeholderTextColor={tone("#8A8472")}
          style={{
            color: theme.colors.ink,
            flex: 1,
            fontFamily: fontFamily("body", 400),
            fontSize: 15,
            minWidth: 0,
          }}
          value={search}
        />
      </View>
      {query.isPending ? (
        <Loading label="Cargando topónimos..." />
      ) : query.isError ? (
        <ErrorMessage message={query.error.message} onRetry={() => void query.refetch()} />
      ) : query.data.length === 0 ? (
        <Card>
          <T c={theme.colors.muted}>Aún no hay topónimos registrados.</T>
        </Card>
      ) : (
        query.data.map((item) => (
          <InfoCard
            key={item.id}
            title={item.name}
            description={item.meaning}
            href={{ pathname: "/toponimos/[toponymId]", params: { toponymId: String(item.id) } }}
            mock={item.isMock}
          />
        ))
      )}
      <Pressable
        accessibilityRole="link"
        onPress={() => router.push("/fuentes")}
        style={{ justifyContent: "center", minHeight: 44 }}
      >
        <T f="display" w={700} s={14.5} c={theme.colors.accent}>
          Ver registros de fuentes
        </T>
      </Pressable>
    </PlainScreen>
  );
}
