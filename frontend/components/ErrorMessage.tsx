import { View } from "react-native";

import { Button } from "./Button";
import { Card } from "./Card";
import { T } from "./T";
import { theme, tone } from "../constants/theme";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <Card
      style={{
        backgroundColor: theme.colors.softDanger,
        borderColor: tone("#F3D3CD"),
      }}
    >
      <T f="display" w={800} s={18} c={theme.colors.danger}>
        No pudimos cargar esta información
      </T>
      <T
        accessibilityRole="alert"
        s={15}
        lh={22}
        c={theme.colors.ink}
        style={{ marginTop: theme.spacing.sm }}
      >
        {message}
      </T>
      {onRetry ? (
        <View style={{ marginTop: theme.spacing.md }}>
          <Button title="Intentar de nuevo" onPress={onRetry} />
        </View>
      ) : null}
    </Card>
  );
}
