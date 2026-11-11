import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Pressable } from "../../components/Pressable";

import { ActivityScene } from "../../components/art/ActivityScene";
import { BackButton } from "../../components/CircleButton";
import { ErrorMessage } from "../../components/ErrorMessage";
import { useHeaderTop } from "../../components/Hero";
import { Icon } from "../../components/Icon";
import { Loading } from "../../components/Loading";
import { ScreenLayout } from "../../components/ScreenLayout";
import { T } from "../../components/T";
import { shadows, theme, tone } from "../../constants/theme";
import {
  useActivity,
  useLesson,
  useProgress,
  useSubmitActivity,
} from "../../hooks/useLearning";

import { useAppearance } from "../../store/settingsStore";
const letters = ["A", "B", "C", "D", "E", "F"];

export default function ActivityScreen() {
  useAppearance();
  const router = useRouter();
  const { activityId: rawId } = useLocalSearchParams<{ activityId: string }>();
  const activityId = Number(rawId);
  const validId = Number.isInteger(activityId) && activityId > 0;
  const activity = useActivity(activityId);
  const lesson = useLesson(activity.data?.lessonId ?? 0);
  const progress = useProgress();
  const submission = useSubmitActivity(activityId);
  const headerTop = useHeaderTop();

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [step, setStep] = useState(0);

  const questions = activity.data?.questions ?? [];
  const question = questions[Math.min(step, Math.max(questions.length - 1, 0))];
  const isLast = step >= questions.length - 1;
  const selected = question ? answers[question.id] : undefined;
  const result = submission.data;

  const submitAnswers = () =>
    submission.mutate({
      answers: questions.map((q) => ({ questionId: q.id, optionId: answers[q.id] })),
    });

  const restart = () => {
    submission.reset();
    setAnswers({});
    setStep(0);
  };

  if (!validId) {
    return (
      <ScreenLayout contentStyle={{ padding: theme.spacing.lg, paddingTop: headerTop }}>
        <ErrorMessage message="El identificador de la actividad no es válido." />
      </ScreenLayout>
    );
  }

  const fallback = lesson.data
    ? ({ pathname: "/lecciones/[lessonId]", params: { lessonId: String(lesson.data.id) } } as const)
    : ("/lenguas" as const);

  return (
    <ScreenLayout nav="aprender" band>
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          height: 44,
          justifyContent: "space-between",
          marginTop: headerTop,
          paddingHorizontal: 14,
        }}
      >
        <View style={{ alignItems: "center", flexDirection: "row", gap: 6 }}>
          <BackButton fallback={fallback} color={theme.colors.heading} background="transparent" />
          <T accessibilityRole="header" f="display" w={700} s={22} c={theme.colors.heading}>
            Aprender
          </T>
        </View>
        <Pressable
          accessibilityLabel={`Actividades completadas: ${progress.data?.completedActivities ?? 0}`}
          onPress={() => router.push("/progreso")}
          style={{
            alignItems: "center",
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: 17,
            borderWidth: 1,
            flexDirection: "row",
            gap: 4,
            height: 34,
            marginRight: 6,
            paddingLeft: 8,
            paddingRight: 12,
          }}
        >
          <Icon name="flame" size={20} color={theme.colors.accent} fill={theme.colors.accent} />
          <T f="display" w={800} s={15} c={theme.colors.accent}>
            {progress.data ? progress.data.completedActivities : "–"}
          </T>
        </Pressable>
      </View>

      {activity.isPending ? (
        <View style={{ paddingHorizontal: 20 }}>
          <Loading label="Cargando actividad..." />
        </View>
      ) : activity.isError ? (
        <View style={{ paddingHorizontal: 20 }}>
          <ErrorMessage message={activity.error.message} onRetry={() => void activity.refetch()} />
        </View>
      ) : questions.length === 0 ? (
        <View style={{ paddingHorizontal: 20 }}>
          <T s={15} c={theme.colors.muted}>
            Esta actividad todavía no tiene preguntas.
          </T>
        </View>
      ) : (
        <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
          {/* Steps */}
          <View
            accessibilityLabel={`Pregunta ${step + 1} de ${questions.length}`}
            accessibilityRole="progressbar"
            style={{ flexDirection: "row", gap: 6 }}
          >
            {questions.map((q, index) => (
              <View
                key={q.id}
                style={{
                  backgroundColor:
                    result || index < step
                      ? theme.colors.primary
                      : index === step
                        ? theme.colors.accent
                        : theme.colors.track,
                  borderRadius: 4,
                  flex: 1,
                  height: 8,
                }}
              />
            ))}
          </View>
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              height: 30,
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            <View
              style={{
                alignItems: "center",
                backgroundColor: theme.colors.softGreen,
                borderRadius: 13,
                flexDirection: "row",
                flexShrink: 1,
                gap: 6,
                height: 26,
                paddingLeft: 8,
                paddingRight: 10,
              }}
            >
              <Icon name="book" size={14} color={tone("#1F5C3A")} strokeWidth={2.2} />
              <T f="display" w={600} s={12.5} c={tone("#1F5C3A")} numberOfLines={1}>
                {lesson.data?.title ?? activity.data.title}
              </T>
            </View>
            <T f="display" w={700} s={14} c={theme.colors.muted}>
              {step + 1} / {questions.length}
            </T>
          </View>

          {/* Illustration */}
          <View
            style={[
              { borderRadius: 22, height: 168, marginTop: 6, overflow: "hidden" },
              shadows.card,
            ]}
          >
            <ActivityScene preserveAspectRatio="xMidYMid slice" />
          </View>

          {/* Question */}
          <T
            accessibilityRole="header"
            f="display"
            w={700}
            s={22}
            lh={28}
            c={theme.colors.ink}
            style={{ marginTop: 14 }}
          >
            {question.prompt}
          </T>
          <T s={13.5} lh={18} c={theme.colors.muted} style={{ marginTop: 2 }}>
            {activity.data.description}
          </T>

          <View accessibilityRole="radiogroup" style={{ gap: 10, marginTop: 14 }}>
            {question.options.map((option, index) => {
              const on = selected === option.id;
              const done = Boolean(result);
              const border = done && on ? (result?.isCorrect ? theme.colors.primary : "#B3261E") : on ? theme.colors.accent : theme.colors.border;
              const bg = done && on ? (result?.isCorrect ? theme.colors.softGreen : theme.colors.softDanger) : on ? tone("#FDF0E6") : theme.colors.surface;
              const badge = done && on ? border : on ? theme.colors.accent : tone("#F1E6D0");
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on, disabled: done }}
                  disabled={done}
                  onPress={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                  style={[
                    {
                      alignItems: "center",
                      backgroundColor: bg,
                      borderColor: border,
                      borderRadius: 16,
                      borderWidth: 2,
                      flexDirection: "row",
                      gap: 14,
                      minHeight: 56,
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                    },
                    shadows.soft,
                  ]}
                >
                  <View
                    style={{
                      alignItems: "center",
                      backgroundColor: badge,
                      borderRadius: 11,
                      height: 36,
                      justifyContent: "center",
                      width: 36,
                    }}
                  >
                    {done && on ? (
                      <Icon
                        name={result?.isCorrect ? "check" : "close"}
                        size={20}
                        color="#FFFFFF"
                        strokeWidth={2.8}
                      />
                    ) : (
                      <T f="display" w={700} s={15} c={on ? "#FFFFFF" : theme.colors.ink}>
                        {letters[index] ?? index + 1}
                      </T>
                    )}
                  </View>
                  <T f="display" w={600} s={17} c={theme.colors.ink} style={{ flex: 1 }}>
                    {option.label}
                  </T>
                </Pressable>
              );
            })}
          </View>

          {submission.isError ? (
            <View style={{ marginTop: 12 }}>
              <ErrorMessage message={submission.error.message} onRetry={submitAnswers} />
            </View>
          ) : null}

          {result ? (
            <View
              accessibilityLiveRegion="polite"
              accessibilityRole="alert"
              style={{
                backgroundColor: result.isCorrect ? theme.colors.softGreen : theme.colors.softDanger,
                borderRadius: 14,
                marginTop: 12,
                padding: 14,
              }}
            >
              <T f="display" w={700} s={15} c={result.isCorrect ? tone("#1F5C3A") : tone("#9A1C14")}>
                {result.isCorrect ? "¡Muy bien! Respuesta correcta." : "Casi. Sigue practicando."}
              </T>
              <T w={700} s={13} lh={19} c={result.isCorrect ? tone("#1F5C3A") : tone("#9A1C14")} style={{ marginTop: 2 }}>
                Puntaje {result.score}/100 · Intento {result.attempts}
              </T>
              <T s={13} lh={19} c={result.isCorrect ? tone("#1F5C3A") : tone("#9A1C14")} style={{ marginTop: 2 }}>
                {result.feedback}
              </T>
            </View>
          ) : null}

          {/* Actions */}
          <View style={{ marginTop: 14 }}>
            {result ? (
              result.isCorrect ? (
                <ActionButton
                  color={theme.colors.primary}
                  label="Continuar"
                  onPress={() => router.replace(fallback)}
                  withArrow
                />
              ) : (
                <ActionButton color={theme.colors.accent} label="Intentar de nuevo" onPress={restart} />
              )
            ) : isLast ? (
              <ActionButton
                color={theme.colors.accent}
                disabled={selected === undefined || submission.isPending || !questions.every((q) => answers[q.id] !== undefined)}
                label={submission.isPending ? "Verificando…" : "Verificar"}
                onPress={submitAnswers}
              />
            ) : (
              <ActionButton
                color={theme.colors.accent}
                disabled={selected === undefined}
                label="Siguiente"
                onPress={() => setStep((s) => s + 1)}
                withArrow
              />
            )}
            {step > 0 && !result ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setStep((s) => Math.max(0, s - 1))}
                style={{ alignItems: "center", height: 44, justifyContent: "center", marginTop: 4 }}
              >
                <T f="display" w={600} s={14} c={theme.colors.heading}>
                  Pregunta anterior
                </T>
              </Pressable>
            ) : null}
          </View>
        </View>
      )}
    </ScreenLayout>
  );
}

function ActionButton({
  label,
  onPress,
  color,
  disabled = false,
  withArrow = false,
}: {
  label: string;
  onPress: () => void;
  color: string;
  disabled?: boolean;
  withArrow?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          alignItems: "center",
          backgroundColor: disabled ? theme.colors.track : color,
          borderRadius: 15,
          flexDirection: "row",
          gap: 8,
          height: 52,
          justifyContent: "center",
          opacity: pressed ? 0.88 : 1,
        },
        disabled ? undefined : shadows.float,
      ]}
    >
      <T f="display" w={700} s={16} c={disabled ? "#6F6A5B" : "#FFFFFF"}>
        {label}
      </T>
      {withArrow && !disabled ? (
        <Icon name="arrowRight" size={18} color="#FFFFFF" strokeWidth={2.2} />
      ) : null}
    </Pressable>
  );
}
