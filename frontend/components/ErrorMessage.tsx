import { Text, View } from "react-native";

import { Button } from "./Button";
import { Card } from "./Card";
import { theme } from "../constants/theme";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <Card
      style={{
        backgroundColor: theme.colors.softDanger,
        borderColor: "#F3D3CD",
      }}
    >
      <Text
        style={{
          color: theme.colors.danger,
          fontSize: 18,
          fontWeight: "800",
        }}
      >
        We could not load this information
      </Text>
      <Text
        accessibilityRole="alert"
        style={{
          color: theme.colors.ink,
          fontSize: 15,
          lineHeight: 22,
          marginTop: theme.spacing.sm,
        }}
      >
        {message}
      </Text>
      {onRetry ? (
        <View className="mt-4">
          <Button title="Try again" onPress={onRetry} />
        </View>
      ) : null}
    </Card>
  );
}

