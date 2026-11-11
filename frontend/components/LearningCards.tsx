import { useRouter } from "expo-router";
import { View } from "react-native";
import { Pressable } from "./Pressable";

import { theme, tone } from "../constants/theme";
import type { Activity, Lesson, ProgressRecord } from "../types/learning";
import { Card } from "./Card";
import { Icon } from "./Icon";
import { MockBadge } from "./MockBadge";
import { ProgressBar } from "./ProgressBar";
import { T } from "./T";

/** Etiqueta verde «Completada» con un check. */
function DonePill({ label = "Completada" }: { label?: string }) {
  return (
    <View
      style={{
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: theme.colors.softGreen,
        borderRadius: 12,
        flexDirection: "row",
        paddingHorizontal: 10,
        paddingVertical: 4,
      }}
    >
      <Icon name="check" size={14} color={tone("#1F5C3A")} strokeWidth={2.6} />
      <T f="display" w={700} s={12} c={tone("#1F5C3A")} style={{ marginLeft: 5 }}>
        {label}
      </T>
    </View>
  );
}

export function LessonCard({
  lesson,
  completed,
  total,
}: {
  lesson: Lesson;
  /** Actividades completadas de esta lección (si no se conoce todavía, no se muestra el avance). */
  completed?: number;
  total?: number;
}) {
  const router = useRouter();
  const known = completed !== undefined && total !== undefined;
  const percentage = known && total ? Math.round((completed / total) * 100) : 0;
  const done = known && total > 0 && completed >= total;

  return (
    <Pressable
      accessibilityRole="link"
      onPress={() =>
        router.push({
          pathname: "/lecciones/[lessonId]",
          params: { lessonId: String(lesson.id) },
        })
      }
    >
      <Card style={{ marginBottom: theme.spacing.md }}>
        <View style={{ alignItems: "center", flexDirection: "row" }}>
          <View
            style={{
              alignItems: "center",
              backgroundColor: done ? theme.colors.primary : theme.colors.softGreen,
              borderRadius: 18,
              height: 36,
              justifyContent: "center",
              marginRight: 12,
              width: 36,
            }}
          >
            <Icon name={done ? "check" : "book"} size={19} color={done ? "#FFFFFF" : theme.colors.primary} strokeWidth={done ? 2.6 : 1.9} />
          </View>
          <T f="display" w={700} s={17} c={theme.colors.ink} style={{ flex: 1 }}>
            {lesson.order}. {lesson.title}
          </T>
          <Icon name="arrowRight" size={19} color={theme.colors.accent} strokeWidth={2.2} />
        </View>
        <T s={14} lh={21} c={theme.colors.muted} style={{ marginTop: theme.spacing.sm }}>
          {lesson.description}
        </T>
        {known && total > 0 ? (
          <View style={{ marginTop: theme.spacing.md }}>
            {done ? (
              <View style={{ marginBottom: 8 }}>
                <DonePill label="Lección completada" />
              </View>
            ) : (
              <T w={600} s={12.5} c={theme.colors.muted} style={{ marginBottom: 6 }}>
                Actividades completadas: {completed}/{total}
              </T>
            )}
            <ProgressBar percentage={percentage} />
          </View>
        ) : null}
        {lesson.isMock ? <MockBadge /> : null}
      </Card>
    </Pressable>
  );
}

export function ActivityCard({ activity, record }: { activity: Activity; record?: ProgressRecord }) {
  const router = useRouter();
  const done = record?.status === "completed";

  return (
    <Pressable
      accessibilityRole="link"
      onPress={() =>
        router.push({
          pathname: "/actividades/[activityId]",
          params: { activityId: String(activity.id) },
        })
      }
    >
      <Card style={{ marginBottom: theme.spacing.md }}>
        <View style={{ alignItems: "center", flexDirection: "row" }}>
          <View
            style={{
              alignItems: "center",
              backgroundColor: done ? theme.colors.primary : theme.colors.accentSoft,
              borderRadius: 18,
              height: 36,
              justifyContent: "center",
              marginRight: 12,
              width: 36,
            }}
          >
            <Icon
              name={done ? "check" : "help"}
              size={19}
              color={done ? "#FFFFFF" : theme.colors.accent}
              strokeWidth={done ? 2.6 : 1.9}
            />
          </View>
          <T f="display" w={700} s={16} c={theme.colors.ink} style={{ flex: 1 }}>
            {activity.title}
          </T>
          <Icon name="arrowRight" size={19} color={theme.colors.accent} strokeWidth={2.2} />
        </View>
        <T s={14} lh={21} c={theme.colors.muted} style={{ marginTop: theme.spacing.sm }}>
          {activity.description}
        </T>
        {done ? (
          <View style={{ alignItems: "center", flexDirection: "row", marginTop: theme.spacing.md }}>
            <DonePill />
            <T w={600} s={12.5} c={theme.colors.muted} style={{ marginLeft: 10 }}>
              Puntaje {record?.score ?? 0}%
            </T>
          </View>
        ) : null}
        {activity.isMock ? <MockBadge /> : null}
      </Card>
    </Pressable>
  );
}
