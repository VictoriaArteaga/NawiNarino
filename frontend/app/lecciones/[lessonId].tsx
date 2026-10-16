import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../../components/Card";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Header } from "../../components/Header";
import { ActivityCard } from "../../components/LearningCards";
import { Loading } from "../../components/Loading";
import { ProgressBar } from "../../components/ProgressBar";
import { useLesson, useLanguageProgress, useLessonActivities } from "../../hooks/useLearning";
import { theme } from "../../constants/theme";

export default function LessonDetailScreen() {
  const { lessonId: rawId } = useLocalSearchParams<{ lessonId: string }>();
  const lessonId = Number(rawId);
  const validId = Number.isInteger(lessonId) && lessonId > 0;
  const lesson = useLesson(lessonId);
  const activities = useLessonActivities(lessonId);
  const progress = useLanguageProgress(lesson.data?.languageId ?? 0);
  const completedIds = new Set(progress.data?.activities.map((item) => item.activityId) ?? []);
  const lessonActivities = activities.data ?? [];
  const completed = lessonActivities.filter((item) => completedIds.has(item.id)).length;

  if (!validId) {
    return (
      <SafeAreaView className="flex-1 p-5" style={{ backgroundColor: theme.colors.canvas }}>
        <ErrorMessage message="The lesson identifier is not valid." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}>
        <Header
          title={lesson.data?.title ?? "Lesson"}
          subtitle={lesson.data?.description}
          backHref={lesson.data ? { pathname: "/lenguas/[id]/lecciones", params: { id: String(lesson.data.languageId) } } : "/lenguas"}
          backLabel="Lessons"
        />
        {lesson.isPending || activities.isPending ? (
          <Loading label="Loading lesson activities..." />
        ) : lesson.isError ? (
          <ErrorMessage message={lesson.error.message} onRetry={() => void lesson.refetch()} />
        ) : activities.isError ? (
          <ErrorMessage message={activities.error.message} onRetry={() => void activities.refetch()} />
        ) : (
          <>
            <Card style={{ marginBottom: theme.spacing.lg }}>
              <ProgressBar
                percentage={lessonActivities.length ? (completed / lessonActivities.length) * 100 : 0}
                label="Lesson progress"
              />
              <Text style={{ color: theme.colors.muted, marginTop: theme.spacing.md }}>
                {completed} of {lessonActivities.length} activities completed
              </Text>
            </Card>
            {lesson.data && progress.isError ? (
              <ErrorMessage
                message={progress.error.message}
                onRetry={() => void progress.refetch()}
              />
            ) : null}
            {lessonActivities.length ? (
              lessonActivities.map((activity) => <ActivityCard key={activity.id} activity={activity} />)
            ) : (
              <Card><Text style={{ color: theme.colors.muted }}>No activities available yet.</Text></Card>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
