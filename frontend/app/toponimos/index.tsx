import { useState } from "react";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../../components/Card";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Header } from "../../components/Header";
import { InfoCard } from "../../components/InfoCard";
import { Loading } from "../../components/Loading";
import { useToponyms } from "../../hooks/useHeritage";
import { theme } from "../../constants/theme";

export default function ToponymsScreen() {
  const [search, setSearch] = useState("");
  const query = useToponyms(search.trim() || undefined);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}>
        <Header title="Toponyms" subtitle="Names and meanings remain pending validation." backHref="/patrimonio" backLabel="Heritage" />
        <Card style={{ marginBottom: theme.spacing.lg }}>
          <TextInput
            accessibilityLabel="Search demonstration place names"
            value={search}
            onChangeText={setSearch}
            placeholder="Search demonstration names"
            placeholderTextColor={theme.colors.muted}
            style={{ color: theme.colors.ink, fontSize: 15, minHeight: 42 }}
          />
        </Card>
        {query.isPending ? <Loading label="Loading toponyms..." /> : query.isError ? (
          <ErrorMessage message={query.error.message} onRetry={() => void query.refetch()} />
        ) : query.data.length === 0 ? (
          <Card><Text style={{ color: theme.colors.muted }}>No matching demonstration names.</Text></Card>
        ) : query.data.map((item) => (
          <InfoCard
            key={item.id}
            title={item.name}
            description={item.meaning}
            href={{ pathname: "/toponimos/[toponymId]", params: { toponymId: String(item.id) } }}
            mock={item.isMock}
          />
        ))}
        <Link href="/fuentes" asChild>
          <Pressable><Text style={{ color: theme.colors.primary, fontWeight: "800", marginTop: theme.spacing.md }}>View source records</Text></Pressable>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}
