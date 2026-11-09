import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { theme } from "../constants/theme";
import type { Activity, Lesson } from "../types/learning";
import { Card } from "./Card";
import { Icon } from "./Icon";
import { MockBadge } from "./MockBadge";
import { ProgressBar } from "./ProgressBar";
import { T } from "./T";

export function LessonCard({
  lesson,
  completed = 0,
  total = 0,
}: {
  lesson: Lesson;
  completed?: number;
  total?: number;
}) {
  const router = useRouter();
  const percentage = total ? Math.round((completed / total) * 100) : 0;

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
        <View style={{ alignItems: "center", flexDirection: "row", gap: 12 }}>
          <View
            style={{
              alignItems: "center",
              backgroundColor: theme.colors.softGreen,
              borderRadius: 18,
              height: 36,
              justifyContent: "center",
              width: 36,
            }}
          >
            <Icon name="book" size={19} color={theme.colors.primary} />
          </View>
          <T f="display" w={700} s={17} c={theme.colors.ink} style={{ flex: 1 }}>
            {lesson.order}. {lesson.title}
          </T>
          <Icon name="arrowRight" size={19} color={theme.colors.accent} strokeWidth={2.2} />
        </View>
        <T s={14} lh={21} c={theme.colors.muted} style={{ marginTop: theme.spacing.sm }}>
          {lesson.description}
        </T>
        <View style={{ marginTop: theme.spacing.md }}>
          <T w={600} s={12.5} c={theme.colors.muted} style={{ marginBottom: 6 }}>
            Actividades completadas: {completed}/{total}
          </T>
          <ProgressBar percentage={percentage} />
        </View>
        {lesson.isMock ? <MockBadge /> : null}
      </Card>
    </Pressable>
  );
}

export function ActivityCard({ activity }: { activity: Activity }) {
  const router = useRouter();

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
        <View style={{ alignItems: "center", flexDirection: "row", gap: 12 }}>
          <View
            style={{
              alignItems: "center",
              backgroundColor: theme.colors.accentSoft,
              borderRadius: 18,
              height: 36,
              justifyContent: "center",
              width: 36,
            }}
          >
            <Icon name="help" size={19} color={theme.colors.accent} />
          </View>
          <T f="display" w={700} s={16} c={theme.colors.ink} style={{ flex: 1 }}>
            {activity.title}
          </T>
          <Icon name="arrowRight" size={19} color={theme.colors.accent} strokeWidth={2.2} />
        </View>
        <T s={14} lh={21} c={theme.colors.muted} style={{ marginTop: theme.spacing.sm }}>
          {activity.description}
        </T>
        {activity.isMock ? <MockBadge /> : null}
      </Card>
    </Pressable>
  );
}
