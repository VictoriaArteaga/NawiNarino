import { Text } from "react-native";

import { theme } from "../constants/theme";
import type { ActivityResult } from "../types/learning";
import { Card } from "./Card";
import { MockBadge } from "./MockBadge";
import { ProgressBar } from "./ProgressBar";

export function ResultCard({ result }: { result: ActivityResult }) {
  return (
    <Card style={{ marginTop: theme.spacing.lg }}>
      <Text
        style={{
          color: result.isCorrect ? theme.colors.primary : theme.colors.accent,
          fontSize: 21,
          fontWeight: "800",
        }}
      >
        {result.isCorrect ? "Correct answer" : "Keep practicing"}
      </Text>
      <Text
        style={{
          color: theme.colors.ink,
          fontSize: 16,
          marginTop: theme.spacing.md,
        }}
      >
        Score: {result.score}/100 · Attempt: {result.attempts}
      </Text>
      <ViewProgress score={result.score} />
      <Text
        style={{
          color: theme.colors.muted,
          fontSize: 14,
          lineHeight: 21,
          marginTop: theme.spacing.md,
        }}
      >
        {result.feedback}
      </Text>
      {result.isMock ? <MockBadge /> : null}
    </Card>
  );
}

function ViewProgress({ score }: { score: number }) {
  return <ProgressBar percentage={score} label="Activity result" />;
}
