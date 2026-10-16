import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../../../components/Card";
import { ErrorMessage } from "../../../components/ErrorMessage";
import { Header } from "../../../components/Header";
import { LessonCard } from "../../../components/LearningCards";
import { Loading } from "../../../components/Loading";
import { ProgressBar } from "../../../components/ProgressBar";
import { useLanguage } from "../../../hooks/useLanguage";
import { useLanguageProgress, useLessons } from "../../../hooks/useLearning";
import { theme } from "../../../constants/theme";

export default function LessonsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const languageId = Number(id);
  const validId = Number.isInteger(languageId) && languageId > 0;
  const language = useLanguage(languageId);
  const lessons = useLessons(languageId);
  const progress = useLanguageProgress(languageId);

  if (!validId) {
    return (
      <SafeAreaView className="flex-1 p-5" style={{ backgroundColor: theme.colors.canvas }}>
        <ErrorMessage message="The language identifier is not valid." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}>
        <Header
          title={language.data?.name ?? "Lessons"}
          subtitle="Learning activities use demonstration content only."
          backHref={{ pathname: "/lenguas/[id]", params: { id: String(languageId) } }}
          backLabel="Language"
        />
        {lessons.isPending || language.isPending ? (
          <Loading label="Loading lessons..." />
        ) : lessons.isError ? (
          <ErrorMessage message={lessons.error.message} onRetry={() => void lessons.refetch()} />
        ) : language.isError ? (
          <ErrorMessage message={language.error.message} onRetry={() => void language.refetch()} />
        ) : lessons.data.length === 0 ? (
          <Card><Text style={{ color: theme.colors.ink }}>No lessons available yet.</Text></Card>
        ) : (
          <>
            {progress.isSuccess ? (
              <Card style={{ marginBottom: theme.spacing.lg }}>
                <ProgressBar percentage={progress.data.percentage} label="Language progress" />
                <Text style={{ color: theme.colors.muted, marginTop: theme.spacing.md }}>
                  {progress.data.completedActivities} of {progress.data.totalActivities} activities completed
                </Text>
              </Card>
            ) : null}
            {progress.isError ? (
              <ErrorMessage
                message={progress.error.message}
                onRetry={() => void progress.refetch()}
              />
            ) : null}
            {lessons.data.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
