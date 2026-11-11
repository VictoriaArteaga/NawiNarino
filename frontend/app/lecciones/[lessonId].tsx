import { useLocalSearchParams } from "expo-router";

import { Card } from "../../components/Card";
import { ErrorMessage } from "../../components/ErrorMessage";
import { ActivityCard } from "../../components/LearningCards";
import { Loading } from "../../components/Loading";
import { InvalidIdScreen, PlainScreen } from "../../components/PlainScreen";
import { ProgressBar } from "../../components/ProgressBar";
import { T } from "../../components/T";
import { theme } from "../../constants/theme";
import {
  useLanguageProgress,
  useLesson,
  useLessonActivities,
} from "../../hooks/useLearning";

import { useAppearance } from "../../store/settingsStore";
export default function LessonDetailScreen() {
  useAppearance();
  const { lessonId: rawId } = useLocalSearchParams<{ lessonId: string }>();
  const lessonId = Number(rawId);
  const validId = Number.isInteger(lessonId) && lessonId > 0;
  const lesson = useLesson(lessonId);
  const activities = useLessonActivities(lessonId);
  const progress = useLanguageProgress(lesson.data?.languageId ?? 0);
  const records = progress.data?.activities ?? [];
  const completedIds = new Set(records.filter((item) => item.status === "completed").map((item) => item.activityId));
  const lessonActivities = activities.data ?? [];
  const completed = lessonActivities.filter((item) => completedIds.has(item.id)).length;

  if (!validId) {
    return <InvalidIdScreen message="El identificador de la lección no es válido." />;
  }

  return (
    <PlainScreen
      title={lesson.data?.title ?? "Lección"}
      subtitle={lesson.data?.description}
      backHref={
        lesson.data
          ? { pathname: "/lenguas/[id]/lecciones", params: { id: String(lesson.data.languageId) } }
          : "/lenguas"
      }
      backLabel="Lecciones"
      nav="aprender"
    >
      {lesson.isPending || activities.isPending ? (
        <Loading label="Cargando actividades de la lección..." />
      ) : lesson.isError ? (
        <ErrorMessage message={lesson.error.message} onRetry={() => void lesson.refetch()} />
      ) : activities.isError ? (
        <ErrorMessage message={activities.error.message} onRetry={() => void activities.refetch()} />
      ) : (
        <>
          <Card style={{ marginBottom: theme.spacing.lg }}>
            <ProgressBar
              percentage={lessonActivities.length ? (completed / lessonActivities.length) * 100 : 0}
              label="Avance en la lección"
            />
            <T s={14} c={theme.colors.muted} style={{ marginTop: theme.spacing.md }}>
              {lessonActivities.length > 0 && completed === lessonActivities.length
                ? "¡Lección completada!"
                : `${completed} de ${lessonActivities.length} actividades completadas`}
            </T>
          </Card>
          {lesson.data && progress.isError ? (
            <ErrorMessage message={progress.error.message} onRetry={() => void progress.refetch()} />
          ) : null}
          {lessonActivities.length ? (
            lessonActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                record={records.find((item) => item.activityId === activity.id)}
              />
            ))
          ) : (
            <Card>
              <T c={theme.colors.muted}>Aún no hay actividades disponibles.</T>
            </Card>
          )}
        </>
      )}
    </PlainScreen>
  );
}
