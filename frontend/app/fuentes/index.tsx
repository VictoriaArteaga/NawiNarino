import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../../components/Card";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Header } from "../../components/Header";
import { InfoCard } from "../../components/InfoCard";
import { Loading } from "../../components/Loading";
import { useSources } from "../../hooks/useHeritage";
import { theme } from "../../constants/theme";

export default function SourcesScreen() {
  const query = useSources();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}>
        <Header title="Sources" subtitle="Demonstration references are not real publications." backHref="/patrimonio" backLabel="Heritage" />
        {query.isPending ? <Loading label="Loading sources..." /> : query.isError ? (
          <ErrorMessage message={query.error.message} onRetry={() => void query.refetch()} />
        ) : query.data.length === 0 ? (
          <Card><Text style={{ color: theme.colors.muted }}>No source records available.</Text></Card>
        ) : query.data.map((source) => (
          <InfoCard
            key={source.id}
            title={source.title}
            description={`${source.author} · ${source.year ?? "Year pending validation"} · ${source.type}`}
            href={{ pathname: "/fuentes/[sourceId]", params: { sourceId: String(source.id) } }}
            mock={source.isMock}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
