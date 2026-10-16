import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AnswerOption } from "../../components/AnswerOption";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Header } from "../../components/Header";
import { Loading } from "../../components/Loading";
import { MockBadge } from "../../components/MockBadge";
import { ResultCard } from "../../components/ResultCard";
import { useActivity, useSubmitActivity } from "../../hooks/useLearning";
import { theme } from "../../constants/theme";

export default function ActivityScreen() {
  const { activityId: rawId } = useLocalSearchParams<{ activityId: string }>();
  const activityId = Number(rawId);
  const validId = Number.isInteger(activityId) && activityId > 0;
  const activity = useActivity(activityId);
  const submission = useSubmitActivity(activityId);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const questionList = activity.data?.questions ?? [];
  const canSubmit =
    questionList.length > 0 &&
    questionList.every((question) => answers[question.id] !== undefined);

  if (!validId) {
    return (
      <SafeAreaView className="flex-1 p-5" style={{ backgroundColor: theme.colors.canvas }}>
        <ErrorMessage message="The activity identifier is not valid." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}>
        <Header
          title={activity.data?.title ?? "Activity"}
          subtitle={activity.data?.description}
          backHref="/lenguas"
          backLabel="Back"
        />
        {activity.isPending ? (
          <Loading label="Loading activity..." />
        ) : activity.isError ? (
          <ErrorMessage message={activity.error.message} onRetry={() => void activity.refetch()} />
        ) : (
          <>
            {questionList.map((question, index) => (
              <Card key={question.id} style={{ marginBottom: theme.spacing.md }}>
                <Text style={{ color: theme.colors.primary, fontWeight: "800" }}>
                  Question {index + 1}
                </Text>
                <Text style={{ color: theme.colors.ink, fontSize: 17, fontWeight: "700", marginTop: theme.spacing.sm }}>
                  {question.prompt}
                </Text>
                {question.options.map((option) => (
                  <AnswerOption
                    key={option.id}
                    label={option.label}
                    selected={answers[question.id] === option.id}
                    onPress={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                  />
                ))}
              </Card>
            ))}
            <MockBadge />
            {submission.isError ? (
              <ErrorMessage
                message={submission.error.message}
                onRetry={() =>
                  submission.mutate({
                    answers: questionList.map((question) => ({
                      questionId: question.id,
                      optionId: answers[question.id],
                    })),
                  })
                }
              />
            ) : null}
            <Button
              title={submission.isPending ? "Submitting..." : "Check answers"}
              disabled={!canSubmit || submission.isPending}
              onPress={() =>
                submission.mutate({
                  answers: questionList.map((question) => ({
                    questionId: question.id,
                    optionId: answers[question.id],
                  })),
                })
              }
              style={{ marginTop: theme.spacing.lg }}
            />
            {submission.data ? <ResultCard result={submission.data} /> : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
