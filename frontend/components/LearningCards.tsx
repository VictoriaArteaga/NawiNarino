import { Link } from "expo-router";
import { ArrowRight, BookOpenCheck, CircleHelp } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { theme } from "../constants/theme";
import type { Activity, Lesson } from "../types/learning";
import { Card } from "./Card";
import { MockBadge } from "./MockBadge";

export function LessonCard({
  lesson,
  completed = 0,
  total = 0,
}: {
  lesson: Lesson;
  completed?: number;
  total?: number;
}) {
  const percentage = total ? Math.round((completed / total) * 100) : 0;
  return (
    <Link
      href={{ pathname: "/lecciones/[lessonId]", params: { lessonId: String(lesson.id) } }}
      asChild
    >
      <Pressable accessibilityRole="link">
        <Card style={{ marginBottom: theme.spacing.md }}>
          <View className="flex-row items-center">
            <BookOpenCheck color={theme.colors.primary} size={23} />
            <Text
              style={{
                color: theme.colors.ink,
                flex: 1,
                fontSize: 18,
                fontWeight: "800",
                marginLeft: theme.spacing.md,
              }}
            >
              {lesson.order}. {lesson.title}
            </Text>
            <ArrowRight color={theme.colors.primary} size={19} />
          </View>
          <Text
            style={{
              color: theme.colors.muted,
              fontSize: 14,
              lineHeight: 21,
              marginTop: theme.spacing.sm,
            }}
          >
            {lesson.description}
          </Text>
          <View style={{ marginTop: theme.spacing.md }}>
            <Text style={{ color: theme.colors.muted, marginBottom: 6 }}>
              Activities completed: {completed}/{total}
            </Text>
            <View
              style={{
                backgroundColor: theme.colors.border,
                borderRadius: theme.radii.pill,
                height: 7,
              }}
            >
              <View
                style={{
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.radii.pill,
                  height: 7,
                  width: `${percentage}%`,
                }}
              />
            </View>
          </View>
          {lesson.isMock ? <MockBadge /> : null}
        </Card>
      </Pressable>
    </Link>
  );
}

export function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <Link
      href={{
        pathname: "/actividades/[activityId]",
        params: { activityId: String(activity.id) },
      }}
      asChild
    >
      <Pressable accessibilityRole="link">
        <Card style={{ marginBottom: theme.spacing.md }}>
          <View className="flex-row items-center">
            <CircleHelp color={theme.colors.accent} size={22} />
            <Text
              style={{
                color: theme.colors.ink,
                flex: 1,
                fontSize: 17,
                fontWeight: "800",
                marginLeft: theme.spacing.md,
              }}
            >
              {activity.title}
            </Text>
            <ArrowRight color={theme.colors.primary} size={19} />
          </View>
          <Text
            style={{
              color: theme.colors.muted,
              fontSize: 14,
              lineHeight: 21,
              marginTop: theme.spacing.sm,
            }}
          >
            {activity.description}
          </Text>
          {activity.isMock ? <MockBadge /> : null}
        </Card>
      </Pressable>
    </Link>
  );
}
