import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../../components/Card";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Header } from "../../components/Header";
import { Loading } from "../../components/Loading";
import { MockBadge } from "../../components/MockBadge";
import { useHeritageItem } from "../../hooks/useHeritage";
import { theme } from "../../constants/theme";

export default function HeritageDetailScreen() {
  const { heritageId: rawId } = useLocalSearchParams<{ heritageId: string }>();
  const heritageId = Number(rawId);
  const validId = Number.isInteger(heritageId) && heritageId > 0;
  const query = useHeritageItem(heritageId);

  if (!validId) {
    return (
      <SafeAreaView className="flex-1 p-5" style={{ backgroundColor: theme.colors.canvas }}>
        <ErrorMessage message="The heritage record identifier is not valid." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}>
        <Header title={query.data?.title ?? "Heritage details"} subtitle="Demonstration record." backHref="/patrimonio" backLabel="Heritage" />
        {query.isPending ? <Loading label="Loading heritage record..." /> : query.isError ? (
          <ErrorMessage message={query.error.message} onRetry={() => void query.refetch()} />
        ) : (
          <Card>
            <Text style={{ color: theme.colors.primary, fontWeight: "800", textTransform: "uppercase" }}>{query.data.category}</Text>
            <Text style={{ color: theme.colors.muted, marginTop: theme.spacing.md }}>
              {query.data.dateLabel ?? "Date pending validation"}
            </Text>
            <Text style={{ color: theme.colors.ink, lineHeight: 23, marginTop: theme.spacing.lg }}>{query.data.description}</Text>
            {query.data.sourceId ? (
              <Link href={{ pathname: "/fuentes/[sourceId]", params: { sourceId: String(query.data.sourceId) } }} asChild>
                <Pressable accessibilityRole="link">
                  <Text style={{ color: theme.colors.primary, fontWeight: "800", marginTop: theme.spacing.lg }}>Open associated source</Text>
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
