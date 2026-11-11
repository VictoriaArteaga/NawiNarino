import { useQueries } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";

import { Card } from "../../../components/Card";
import { ErrorMessage } from "../../../components/ErrorMessage";
import { LessonCard } from "../../../components/LearningCards";
import { Loading } from "../../../components/Loading";
import { InvalidIdScreen, PlainScreen } from "../../../components/PlainScreen";
import { ProgressBar } from "../../../components/ProgressBar";
import { T } from "../../../components/T";
import { theme } from "../../../constants/theme";
import { useLanguage } from "../../../hooks/useLanguage";
import { useLanguageProgress, useLessons } from "../../../hooks/useLearning";
import { getLessonActivities } from "../../../services/learning.service";

import { useAppearance } from "../../../store/settingsStore";
export default function LessonsScreen() {
  useAppearance();
  const { id } = useLocalSearchParams<{ id: string }>();
  const languageId = Number(id);
  const validId = Number.isInteger(languageId) && languageId > 0;
  const language = useLanguage(languageId);
  const lessons = useLessons(languageId);
  const progress = useLanguageProgress(languageId);

  // Actividades de cada lección (misma clave de caché que la pantalla de la lección) para contar las completadas.
  const lessonActivities = useQueries({
    queries: (lessons.data ?? []).map((lesson) => ({
      queryKey: ["lessons", lesson.id, "activities"],
      queryFn: () => getLessonActivities(lesson.id),
    })),
  });
  const completedIds = new Set(
    (progress.data?.activities ?? []).filter((item) => item.status === "completed").map((item) => item.activityId),
  );

  if (!validId) {
    return <InvalidIdScreen message="El identificador de la lengua no es válido." />;
  }

  return (
    <PlainScreen
      title={language.data?.name ?? "Lecciones"}
      subtitle="Las actividades usan palabras de documentos reales."
      backHref={{ pathname: "/lenguas/[id]", params: { id: String(languageId) } }}
      backLabel="Lengua"
      nav="aprender"
    >
      {lessons.isPending || language.isPending ? (
        <Loading label="Cargando lecciones..." />
      ) : lessons.isError ? (
        <ErrorMessage message={lessons.error.message} onRetry={() => void lessons.refetch()} />
      ) : language.isError ? (
        <ErrorMessage message={language.error.message} onRetry={() => void language.refetch()} />
      ) : lessons.data.length === 0 ? (
        <Card>
          <T c={theme.colors.ink}>Aún no hay lecciones disponibles.</T>
        </Card>
      ) : (
        <>
          {progress.isSuccess ? (
            <Card style={{ marginBottom: theme.spacing.lg }}>
              <ProgressBar percentage={progress.data.percentage} label="Avance en la lengua" />
              <T s={14} c={theme.colors.muted} style={{ marginTop: theme.spacing.md }}>
                {progress.data.completedActivities} de {progress.data.totalActivities} actividades completadas
              </T>
            </Card>
          ) : null}
          {progress.isError ? (
            <ErrorMessage message={progress.error.message} onRetry={() => void progress.refetch()} />
          ) : null}
          {lessons.data.map((lesson, index) => {
            const activities = lessonActivities[index]?.data;
            const ready = progress.isSuccess && activities !== undefined;
            return (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                completed={ready ? activities.filter((a) => completedIds.has(a.id)).length : undefined}
                total={ready ? activities.length : undefined}
              />
            );
          })}
        </>
      )}
    </PlainScreen>
  );
}
