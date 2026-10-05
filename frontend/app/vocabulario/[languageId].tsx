import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../../components/Card";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Header } from "../../components/Header";
import { Loading } from "../../components/Loading";
import { VocabularyCard } from "../../components/VocabularyCard";
import { useLanguage } from "../../hooks/useLanguage";
import { useVocabulary } from "../../hooks/useVocabulary";
import { theme } from "../../constants/theme";

export default function VocabularyScreen() {
  const { languageId: rawLanguageId } = useLocalSearchParams<{
    languageId: string;
  }>();
  const languageId = Number(rawLanguageId);
  const validLanguageId = Number.isInteger(languageId) && languageId > 0;
  const languageQuery = useLanguage(languageId);
  const vocabularyQuery = useVocabulary(languageId);

  if (!validLanguageId) {
    return (
      <SafeAreaView
        className="flex-1 p-5"
        style={{ backgroundColor: theme.colors.canvas }}
      >
        <ErrorMessage message="The language identifier is not valid." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.colors.canvas }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: theme.spacing.xxl,
        }}
      >
        <Header
          title={languageQuery.data?.name ?? "Sample vocabulary"}
          subtitle="Temporary examples only. No real words or translations are provided."
          backHref={{
            pathname: "/lenguas/[id]",
            params: { id: String(languageId) },
          }}
          backLabel="Language details"
        />

        {vocabularyQuery.isPending || languageQuery.isPending ? (
          <Loading label="Loading vocabulary..." />
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
        ) : vocabularyQuery.data.length === 0 ? (
          <Card>
            <Text
              style={{
                color: theme.colors.ink,
                fontSize: 18,
                fontWeight: "800",
              }}
            >
              No vocabulary samples yet
            </Text>
            <Text
              style={{
                color: theme.colors.muted,
                fontSize: 15,
                lineHeight: 22,
                marginTop: theme.spacing.sm,
              }}
            >
              Validated vocabulary will be added when it is available.
            </Text>
          </Card>
        ) : (
          vocabularyQuery.data.map((item) => (
            <VocabularyCard key={item.id} item={item} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

