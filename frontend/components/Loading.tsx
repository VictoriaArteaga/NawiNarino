import { ActivityIndicator, Text, View } from "react-native";

import { theme } from "../constants/theme";

interface LoadingProps {
  label?: string;
}

export function Loading({ label = "Loading information..." }: LoadingProps) {
  return (
    <View className="items-center justify-center py-12">
      <ActivityIndicator color={theme.colors.primary} size="large" />
      <Text
        style={{
          color: theme.colors.muted,
          fontSize: 15,
          marginTop: theme.spacing.md,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

