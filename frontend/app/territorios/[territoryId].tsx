import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../../components/Card";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Header } from "../../components/Header";
import { Loading } from "../../components/Loading";
import { MockBadge } from "../../components/MockBadge";
import { useTerritory } from "../../hooks/useTerritories";
import { theme } from "../../constants/theme";

export default function TerritoryDetailScreen() {
  const { territoryId: rawId } = useLocalSearchParams<{ territoryId: string }>();
  const territoryId = Number(rawId);
  const validId = Number.isInteger(territoryId) && territoryId > 0;
  const query = useTerritory(territoryId);

  if (!validId) {
    return (
      <SafeAreaView className="flex-1 p-5" style={{ backgroundColor: theme.colors.canvas }}>
        <ErrorMessage message="The territory identifier is not valid." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}>
        <Header title={query.data?.name ?? "Territory"} subtitle="Demonstration territory details." backHref="/mapa" backLabel="Map" />
        {query.isPending ? <Loading label="Loading territory..." /> : query.isError ? (
          <ErrorMessage message={query.error.message} onRetry={() => void query.refetch()} />
        ) : (
          <Card>
            <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: "800" }}>REGION</Text>
            <Text style={{ color: theme.colors.ink, fontSize: 17, marginTop: theme.spacing.xs }}>{query.data.region}</Text>
            <Text style={{ color: theme.colors.muted, lineHeight: 22, marginTop: theme.spacing.lg }}>{query.data.description}</Text>
            <Text style={{ color: theme.colors.muted, marginTop: theme.spacing.lg }}>
              Coordinates: {query.data.latitude === null || query.data.longitude === null ? "pending validation" : `${query.data.latitude}, ${query.data.longitude}`}
            </Text>
            <MockBadge />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
