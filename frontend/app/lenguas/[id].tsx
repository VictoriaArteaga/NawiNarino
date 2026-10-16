import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { CulturalInfoCard } from "../../components/CulturalInfoCard";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Header } from "../../components/Header";
import { Loading } from "../../components/Loading";
import { useCulturalContent, useLanguage } from "../../hooks/useLanguage";
import { useAppStore } from "../../store/appStore";
import { theme } from "../../constants/theme";

export default function LanguageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const setSelectedLanguageId = useAppStore(
    (state) => state.setSelectedLanguageId,
  );
  const languageId = Number(id);
  const validLanguageId = Number.isInteger(languageId) && languageId > 0;
  const languageQuery = useLanguage(languageId);
  const cultureQuery = useCulturalContent(languageId);

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
          title={languageQuery.data?.name ?? "Language information"}
          subtitle="General details and cultural demonstration content."
          backHref="/lenguas"
          backLabel="Languages"
        />

        {languageQuery.isPending ? (
          <Loading label="Loading language information..." />
        ) : languageQuery.isError ? (
          <ErrorMessage
            message={languageQuery.error.message}
            onRetry={() => void languageQuery.refetch()}
          />
        ) : (
          <>
            {languageQuery.data.isMock ? (
              <Card
                style={{
                  backgroundColor: theme.colors.mockBackground,
                  borderColor: theme.colors.mockBackground,
                  marginBottom: theme.spacing.md,
                }}
              >
                <Text
                  style={{
                    color: theme.colors.mockText,
                    fontSize: 14,
                    fontWeight: "800",
                  }}
                >
                  DEMONSTRATION DATA
                </Text>
                <Text
                  style={{
                    color: theme.colors.mockText,
                    fontSize: 14,
                    lineHeight: 21,
                    marginTop: theme.spacing.xs,
                  }}
                >
                  This information is temporary and has not been validated.
                </Text>
              </Card>
            ) : null}

            <Card style={{ marginBottom: theme.spacing.xl }}>
              <Text
                style={{
                  color: theme.colors.primary,
                  fontSize: 12,
                  fontWeight: "800",
                  letterSpacing: 1,
                }}
              >
                OVERVIEW
              </Text>
              <Text
                style={{
                  color: theme.colors.ink,
                  fontSize: 16,
                  lineHeight: 24,
                  marginTop: theme.spacing.sm,
                }}
              >
                {languageQuery.data.shortDescription}
              </Text>
              <Text
                style={{
                  color: theme.colors.primary,
                  fontSize: 12,
                  fontWeight: "800",
                  letterSpacing: 1,
                  marginTop: theme.spacing.lg,
                }}
              >
                CULTURAL INFORMATION
              </Text>
              <Text
                style={{
                  color: theme.colors.ink,
                  fontSize: 16,
                  lineHeight: 24,
                  marginTop: theme.spacing.sm,
                }}
              >
                {languageQuery.data.culturalDescription}
              </Text>
            </Card>

            <Text
              style={{
                color: theme.colors.ink,
                fontSize: 20,
                fontWeight: "800",
                marginBottom: theme.spacing.md,
              }}
            >
              Cultural content
            </Text>
            {cultureQuery.isPending ? (
              <Loading label="Loading cultural content..." />
            ) : cultureQuery.isError ? (
              <ErrorMessage
                message={cultureQuery.error.message}
                onRetry={() => void cultureQuery.refetch()}
              />
            ) : cultureQuery.data.length === 0 ? (
              <Card style={{ marginBottom: theme.spacing.lg }}>
                <Text style={{ color: theme.colors.muted, fontSize: 15 }}>
                  No cultural content is available yet.
                </Text>
              </Card>
            ) : (
              cultureQuery.data.map((content) => (
                <CulturalInfoCard key={content.id} content={content} />
              ))
            )}

            <Button
              title="Explore sample vocabulary"
              onPress={() => {
                setSelectedLanguageId(languageQuery.data.id);
                router.push({
                  pathname: "/vocabulario/[languageId]",
                  params: { languageId: String(languageQuery.data.id) },
                });
              }}
              style={{ marginTop: theme.spacing.md }}
            />
            <Button
              title="Explore demonstration lessons"
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: "/lenguas/[id]/lecciones",
                  params: { id: String(languageQuery.data.id) },
                })
              }
              style={{ marginTop: theme.spacing.md }}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
