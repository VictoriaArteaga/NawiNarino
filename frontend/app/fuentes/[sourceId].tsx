import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../../components/Card";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Header } from "../../components/Header";
import { Loading } from "../../components/Loading";
import { MockBadge } from "../../components/MockBadge";
import { useSource } from "../../hooks/useHeritage";
import { theme } from "../../constants/theme";

export default function SourceDetailScreen() {
  const { sourceId: rawId } = useLocalSearchParams<{ sourceId: string }>();
  const sourceId = Number(rawId);
  const validId = Number.isInteger(sourceId) && sourceId > 0;
  const query = useSource(sourceId);

  if (!validId) {
    return (
      <SafeAreaView className="flex-1 p-5" style={{ backgroundColor: theme.colors.canvas }}>
        <ErrorMessage message="The source identifier is not valid." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}>
        <Header title={query.data?.title ?? "Source"} subtitle="Demonstration citation record." backHref="/fuentes" backLabel="Sources" />
        {query.isPending ? <Loading label="Loading source..." /> : query.isError ? (
          <ErrorMessage message={query.error.message} onRetry={() => void query.refetch()} />
        ) : (
          <Card>
            <Text style={{ color: theme.colors.ink, fontWeight: "800" }}>{query.data.author} · {query.data.year ?? "Year pending validation"}</Text>
            <Text style={{ color: theme.colors.primary, fontWeight: "800", marginTop: theme.spacing.lg }}>TYPE</Text>
            <Text style={{ color: theme.colors.ink, marginTop: theme.spacing.xs }}>{query.data.type}</Text>
            <Text style={{ color: theme.colors.primary, fontWeight: "800", marginTop: theme.spacing.lg }}>REFERENCE</Text>
            <Text style={{ color: theme.colors.ink, lineHeight: 22, marginTop: theme.spacing.xs }}>{query.data.reference}</Text>
            <Text style={{ color: theme.colors.muted, lineHeight: 22, marginTop: theme.spacing.lg }}>{query.data.description}</Text>
            <MockBadge />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
