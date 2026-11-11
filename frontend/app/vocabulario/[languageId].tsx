import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";

import { BackButton } from "../../components/CircleButton";
import { Card } from "../../components/Card";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Hero, useHeaderTop } from "../../components/Hero";
import { Icon } from "../../components/Icon";
import { Loading } from "../../components/Loading";
import { ScreenLayout } from "../../components/ScreenLayout";
import { T } from "../../components/T";
import { VocabularyCard } from "../../components/VocabularyCard";
import { getLanguageTheme } from "../../constants/languages";
import { fontFamily, shadows, theme } from "../../constants/theme";
import { useLanguage } from "../../hooks/useLanguage";
import { useVocabulary } from "../../hooks/useVocabulary";

const tagPalette: [string, string][] = [
  ["#FBE3D6", "#8E2F22"],
  ["#E6DDF3", "#4A2F78"],
  ["#DCEBDD", "#1F4D3A"],
  ["#F8E4C0", "#7A4A05"],
  ["#D9E9F4", "#1D4A75"],
];

function tagColors(category: string): [string, string] {
  let hash = 0;
  for (const char of category) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return tagPalette[hash % tagPalette.length];
}

export default function VocabularyScreen() {
  const { languageId: rawLanguageId } = useLocalSearchParams<{
    languageId: string;
  }>();
  const languageId = Number(rawLanguageId);
  const validLanguageId = Number.isInteger(languageId) && languageId > 0;
  const languageQuery = useLanguage(languageId);
  const vocabularyQuery = useVocabulary(languageId);
  const headerTop = useHeaderTop();

  const [category, setCategory] = useState("Todos");
  const [search, setSearch] = useState("");

  const look = getLanguageTheme(languageQuery.data?.name);
  const HeroArt = look.Hero;
  const items = vocabularyQuery.data;

  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set((items ?? []).map((i) => i.category)))],
    [items],
  );
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (items ?? []).filter(
      (item) =>
        (category === "Todos" || item.category === category) &&
        (!needle || `${item.word} ${item.translation}`.toLowerCase().includes(needle)),
    );
  }, [items, category, search]);

  if (!validLanguageId) {
    return (
      <ScreenLayout contentStyle={{ padding: theme.spacing.lg, paddingTop: headerTop }}>
        <ErrorMessage message="El identificador de la lengua no es válido." />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout nav="aprender">
      <Hero height={168} art={<HeroArt preserveAspectRatio="xMidYMin slice" />}>
        <View style={{ left: 14, position: "absolute", top: headerTop }}>
          <BackButton
            fallback={{ pathname: "/lenguas/[id]", params: { id: String(languageId) } }}
          />
        </View>
        <View style={{ left: 68, position: "absolute", right: 20, top: headerTop }}>
          <T accessibilityRole="header" f="display" w={800} s={26} lh={30} c={theme.colors.primaryDark}>
            Vocabulario
          </T>
          <T s={13} lh={16} c="#33423B" numberOfLines={1}>
            {languageQuery.data
              ? `${languageQuery.data.name} · ${items ? items.length : "–"} palabras con fuente`
              : "Cargando…"}
          </T>
        </View>
      </Hero>

      {/* Search */}
      <View
        style={[
          {
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            borderColor: "#CFE0D2",
            borderRadius: 26,
            borderWidth: 2,
            flexDirection: "row",
            gap: 10,
            height: 52,
            marginHorizontal: 20,
            marginTop: -24,
            paddingHorizontal: 14,
          },
          shadows.float,
        ]}
      >
        <Icon name="search" size={20} color={theme.colors.primary} strokeWidth={2} />
        <TextInput
          accessibilityLabel="Buscar palabra"
          onChangeText={setSearch}
          placeholder="Buscar palabra…"
          placeholderTextColor="#8A8472"
          returnKeyType="search"
          style={{
            color: theme.colors.ink,
            flex: 1,
            fontFamily: fontFamily("body", 400),
            fontSize: 15,
            minWidth: 0,
          }}
          value={search}
        />
        {search ? (
          <Pressable accessibilityLabel="Borrar búsqueda" onPress={() => setSearch("")}>
            <Icon name="close" size={20} color="#8A8472" />
          </Pressable>
        ) : null}
      </View>

      {/* Categories */}
      <ScrollView
        contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, marginTop: 16 }}
      >
        {categories.map((label) => {
          const active = label === category;
          return (
            <Pressable
              key={label}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setCategory(label)}
              style={{
                alignItems: "center",
                backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                borderColor: active ? theme.colors.primary : theme.colors.border,
                borderRadius: 20,
                borderWidth: 1.5,
                height: 40,
                justifyContent: "center",
                paddingHorizontal: 16,
              }}
            >
              <T f="display" w={600} s={14} c={active ? "#FFFFFF" : theme.colors.ink}>
                {label}
              </T>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Words */}
      <View style={{ gap: 10, paddingHorizontal: 20, paddingTop: 14 }}>
        {vocabularyQuery.isPending || languageQuery.isPending ? (
          <Loading label="Cargando vocabulario..." />
        ) : vocabularyQuery.isError ? (
          <ErrorMessage
            message={vocabularyQuery.error.message}
            onRetry={() => void vocabularyQuery.refetch()}
          />
        ) : languageQuery.isError ? (
          <ErrorMessage
            message={languageQuery.error.message}
            onRetry={() => void languageQuery.refetch()}
          />
        ) : (
          <>
            {items && items.length === 0 ? (
              <Card>
                <T f="display" w={800} s={18}>
                  Aún no hay vocabulario
                </T>
                <T s={15} lh={22} c={theme.colors.muted} style={{ marginTop: theme.spacing.sm }}>
                  Pronto se agregarán más palabras.
                </T>
              </Card>
            ) : filtered.length === 0 ? (
              <View
                style={{
                  alignItems: "center",
                  backgroundColor: theme.colors.surface,
                  borderColor: "#D9CBB0",
                  borderRadius: 18,
                  borderStyle: "dashed",
                  borderWidth: 1,
                  padding: 24,
                }}
              >
                <T f="display" w={700} s={16} c={theme.colors.primaryDark}>
                  No encontramos esa palabra
                </T>
                <T s={13} c={theme.colors.muted} style={{ marginTop: 4 }}>
                  Prueba con otra o cambia de categoría.
                </T>
              </View>
            ) : (
              filtered.map((item) => {
                const [bg, fg] = tagColors(item.category);
                return (
                  <VocabularyCard key={item.id} item={item} tagBackground={bg} tagColor={fg} />
                );
              })
            )}
          </>
        )}
      </View>
    </ScreenLayout>
  );
}
