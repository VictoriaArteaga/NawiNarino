import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../components/Card";
import { ErrorMessage } from "../components/ErrorMessage";
import { Header } from "../components/Header";
import { Loading } from "../components/Loading";
import { MockBadge } from "../components/MockBadge";
import { ProgressBar } from "../components/ProgressBar";
import { useProgress } from "../hooks/useLearning";
import { theme } from "../constants/theme";

export default function ProgressScreen() {
  const query = useProgress();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}>
        <Header title="Your progress" subtitle="Activity progress for this device's demonstration profile." backHref="/inicio" backLabel="Home" />
        {query.isPending ? (
          <Loading label="Loading progress..." />
        ) : query.isError ? (
          <ErrorMessage message={query.error.message} onRetry={() => void query.refetch()} />
        ) : (
          <>
            <Card style={{ marginBottom: theme.spacing.md }}>
              <ProgressBar percentage={query.data.percentage} label="Overall progress" />
              <Text style={{ color: theme.colors.ink, fontSize: 16, marginTop: theme.spacing.lg }}>
                {query.data.completedActivities} of {query.data.totalActivities} activities completed
              </Text>
              <Text style={{ color: theme.colors.muted, marginTop: theme.spacing.sm }}>
                Average score: {query.data.averageScore}/100
              </Text>
              <MockBadge />
            </Card>
            {query.data.activities.length === 0 ? (
              <Card><Text style={{ color: theme.colors.muted }}>Complete a demonstration activity to see progress here.</Text></Card>
            ) : (
              query.data.activities.map((record) => (
                <Card key={record.id} style={{ marginBottom: theme.spacing.md }}>
                  <Text style={{ color: theme.colors.ink, fontWeight: "800" }}>Activity {record.activityId}</Text>
                  <Text style={{ color: theme.colors.muted, marginTop: theme.spacing.sm }}>
                    Score {record.score}/100 · {record.attempts} {record.attempts === 1 ? "attempt" : "attempts"}
                  </Text>
                  <Text style={{ color: theme.colors.muted, marginTop: theme.spacing.xs }}>
                    {record.completedAt ? new Date(record.completedAt).toLocaleDateString() : "Not completed"}
                  </Text>
                </Card>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
