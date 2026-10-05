import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../../components/Card";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Header } from "../../components/Header";
import { LanguageCard } from "../../components/LanguageCard";
import { Loading } from "../../components/Loading";
import { useLanguages } from "../../hooks/useLanguages";
import { theme } from "../../constants/theme";

export default function LanguagesScreen() {
  const languagesQuery = useLanguages();

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
          title="Languages"
          subtitle="Choose a language to explore its information and sample vocabulary."
          backHref="/inicio"
          backLabel="Home"
        />

        {languagesQuery.isPending ? (
          <Loading label="Loading languages..." />
        ) : languagesQuery.isError ? (
          <ErrorMessage
            message={languagesQuery.error.message}
            onRetry={() => void languagesQuery.refetch()}
          />
        ) : languagesQuery.data.length === 0 ? (
          <Card>
            <Text
              style={{
                color: theme.colors.ink,
                fontSize: 18,
                fontWeight: "800",
              }}
            >
              No languages available yet
            </Text>
            <Text
              style={{
                color: theme.colors.muted,
                fontSize: 15,
                lineHeight: 22,
                marginTop: theme.spacing.sm,
              }}
            >
              Please check again when language records have been added.
            </Text>
          </Card>
        ) : (
          <>
            <View
              style={{
                backgroundColor: theme.colors.mockBackground,
                borderRadius: theme.radii.button,
                marginBottom: theme.spacing.lg,
                padding: theme.spacing.md,
              }}
            >
              <Text
                style={{
                  color: theme.colors.mockText,
                  fontSize: 13,
                  fontWeight: "700",
                  lineHeight: 19,
                }}
              >
                These are demonstration records only. Names and any future
                content must be confirmed before being presented as verified.
              </Text>
            </View>
            {languagesQuery.data.map((language) => (
              <LanguageCard key={language.id} language={language} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

