import { useState } from "react";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../../components/Card";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Header } from "../../components/Header";
import { InfoCard } from "../../components/InfoCard";
import { Loading } from "../../components/Loading";
import { MockBadge } from "../../components/MockBadge";
import { useHeritage } from "../../hooks/useHeritage";
import type { HeritageCategory } from "../../types/heritage";
import { theme } from "../../constants/theme";

const categories: { label: string; value?: HeritageCategory }[] = [
  { label: "All" },
  { label: "Historical", value: "historical" },
  { label: "Linguistic", value: "linguistic" },
  { label: "Cultural", value: "cultural" },
  { label: "Toponymy", value: "toponymy" },
];

export default function HeritageScreen() {
  const [category, setCategory] = useState<HeritageCategory | undefined>();
  const query = useHeritage(category);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}>
        <Header title="Heritage" subtitle="Demonstration records pending validation." backHref="/inicio" backLabel="Home" />
        <View className="mb-4 flex-row flex-wrap">
          {categories.map((item) => {
            const active = category === item.value;
            return (
              <Pressable
                key={item.label}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setCategory(item.value)}
                style={{
                  backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radii.pill,
                  borderWidth: 1,
                  marginBottom: theme.spacing.sm,
                  marginRight: theme.spacing.sm,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.sm,
                }}
              >
                <Text style={{ color: active ? theme.colors.surface : theme.colors.ink, fontWeight: "700" }}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <View className="mb-4 flex-row">
          <Link href="/toponimos" asChild><Pressable><Text style={{ color: theme.colors.primary, fontWeight: "800", marginRight: theme.spacing.lg }}>Toponyms</Text></Pressable></Link>
          <Link href="/fuentes" asChild><Pressable><Text style={{ color: theme.colors.primary, fontWeight: "800" }}>Sources</Text></Pressable></Link>
        </View>
        {query.isPending ? <Loading label="Loading heritage..." /> : query.isError ? (
          <ErrorMessage message={query.error.message} onRetry={() => void query.refetch()} />
        ) : query.data.length === 0 ? (
          <Card><Text style={{ color: theme.colors.muted }}>No records in this category.</Text></Card>
        ) : query.data.map((item) => (
          <InfoCard
            key={item.id}
            title={item.title}
            description={`${item.category} · ${item.dateLabel ?? "Date pending validation"}\n${item.description}`}
            href={{ pathname: "/patrimonio/[heritageId]", params: { heritageId: String(item.id) } }}
            mock={item.isMock}
          />
        ))}
        {query.data?.length ? <MockBadge /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}
