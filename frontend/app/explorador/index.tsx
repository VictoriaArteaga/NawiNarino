import { useRouter } from "expo-router";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Header } from "../../components/Header";
import { theme } from "../../constants/theme";

export default function ExplorerScreen() {
  const router = useRouter();

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.colors.canvas }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: theme.spacing.xxl,
        }}
      >
        <Header
          title="AI Explorer"
          subtitle="A future, source-grounded way to explore validated documents."
          backHref="/inicio"
          backLabel="Home"
        />
        <Card
          style={{ backgroundColor: theme.colors.softGreen }}
        >
          <Text
            style={{
              color: theme.colors.primaryDark,
              fontSize: 13,
              fontWeight: "800",
              letterSpacing: 0.6,
            }}
          >
            NOT AVAILABLE YET
          </Text>
          <Text
            style={{
              color: theme.colors.ink,
              fontSize: 17,
              fontWeight: "700",
              lineHeight: 24,
              marginTop: theme.spacing.sm,
            }}
          >
            AI and automatic answers are not implemented in this version.
          </Text>
          <Text
            style={{
              color: theme.colors.muted,
              fontSize: 15,
              lineHeight: 23,
              marginTop: theme.spacing.sm,
            }}
          >
            A future explorer should retrieve information from validated
            documents, cite its sources, and clearly say when there is not
            enough evidence. No questions are sent to an AI service here.
          </Text>
        </Card>
        <Button
          title="Review demonstration sources"
          onPress={() => router.push("/fuentes")}
          variant="secondary"
          style={{ marginTop: theme.spacing.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
