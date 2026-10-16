import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../../components/Card";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Header } from "../../components/Header";
import { Loading } from "../../components/Loading";
import { MockBadge } from "../../components/MockBadge";
import { useToponym } from "../../hooks/useHeritage";
import { theme } from "../../constants/theme";

export default function ToponymDetailScreen() {
  const { toponymId: rawId } = useLocalSearchParams<{ toponymId: string }>();
  const toponymId = Number(rawId);
  const validId = Number.isInteger(toponymId) && toponymId > 0;
  const query = useToponym(toponymId);

  if (!validId) {
    return (
      <SafeAreaView className="flex-1 p-5" style={{ backgroundColor: theme.colors.canvas }}>
        <ErrorMessage message="The toponym identifier is not valid." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}>
        <Header title={query.data?.name ?? "Toponym"} subtitle="Meaning is not asserted as factual." backHref="/toponimos" backLabel="Toponyms" />
        {query.isPending ? <Loading label="Loading toponym..." /> : query.isError ? (
          <ErrorMessage message={query.error.message} onRetry={() => void query.refetch()} />
        ) : (
          <Card>
            <Text style={{ color: theme.colors.primary, fontWeight: "800" }}>MEANING</Text>
            <Text style={{ color: theme.colors.ink, lineHeight: 22, marginTop: theme.spacing.sm }}>{query.data.meaning}</Text>
            <Text style={{ color: theme.colors.primary, fontWeight: "800", marginTop: theme.spacing.lg }}>DESCRIPTION</Text>
            <Text style={{ color: theme.colors.ink, lineHeight: 22, marginTop: theme.spacing.sm }}>{query.data.description}</Text>
            <Text style={{ color: theme.colors.primary, fontWeight: "800", marginTop: theme.spacing.lg }}>HISTORICAL CONTEXT</Text>
            <Text style={{ color: theme.colors.ink, lineHeight: 22, marginTop: theme.spacing.sm }}>{query.data.historicalContext}</Text>
            {query.data.source ? (
              <Link href={{ pathname: "/fuentes/[sourceId]", params: { sourceId: String(query.data.source.id) } }} asChild>
                <Pressable accessibilityRole="link">
                  <Text style={{ color: theme.colors.primary, fontWeight: "800", marginTop: theme.spacing.lg }}>
                    Source: {query.data.source.title}
                  </Text>
                </Pressable>
              </Link>
            ) : null}
            <MockBadge />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
