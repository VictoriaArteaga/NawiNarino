import { BookOpen, Languages, MapPin, Sparkles, Trophy } from "lucide-react-native";
import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Header } from "../../components/Header";
import { theme } from "../../constants/theme";

export default function HomeScreen() {
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
          title="Explore the languages of Nariño"
          subtitle="Discover, learn, and explore the region's linguistic heritage."
        />

        <Card
          style={{
            backgroundColor: theme.colors.primaryDark,
            borderColor: theme.colors.primaryDark,
            marginBottom: theme.spacing.lg,
            padding: theme.spacing.xl,
          }}
        >
          <View
            style={{
              alignItems: "center",
              backgroundColor: "#FFFFFF24",
              borderRadius: theme.radii.button,
              height: 50,
              justifyContent: "center",
              marginBottom: theme.spacing.lg,
              width: 50,
            }}
          >
            <BookOpen color={theme.colors.surface} size={24} />
          </View>
          <Text
            style={{
              color: theme.colors.surface,
              fontSize: 30,
              fontWeight: "800",
            }}
          >
            ÑAWI-Nariño
          </Text>
          <Text
            style={{
              color: "#E3EEE8",
              fontSize: 16,
              lineHeight: 24,
              marginTop: theme.spacing.sm,
            }}
          >
            A space to learn about the languages and living heritage of Nariño.
          </Text>
          <Button
            title="Explore languages"
            onPress={() => router.push("/lenguas")}
            variant="secondary"
            style={{ marginTop: theme.spacing.xl }}
          />
        </Card>

        <View className="mb-3 flex-row items-center">
          <Languages color={theme.colors.primary} size={20} />
          <Text
            style={{
              color: theme.colors.ink,
              fontSize: 18,
              fontWeight: "800",
              marginLeft: theme.spacing.sm,
            }}
          >
            Learn with care
          </Text>
        </View>
        <Text
          style={{
            color: theme.colors.muted,
            fontSize: 15,
            lineHeight: 23,
            marginBottom: theme.spacing.lg,
          }}
        >
          This early version uses clearly labeled demonstration content. It
          makes no claims about verified vocabulary or cultural knowledge.
        </Text>
        <Card>
          <Text
            style={{
              color: theme.colors.mockText,
              fontSize: 12,
              fontWeight: "800",
              letterSpacing: 0.8,
            }}
          >
            DEMONSTRATION VERSION
          </Text>
          <Text
            style={{
              color: theme.colors.ink,
              fontSize: 15,
              lineHeight: 22,
              marginTop: theme.spacing.sm,
            }}
          >
            Language and cultural records are temporary and pending validation
            with reliable sources and community guidance.
          </Text>
        </Card>
        <View className="mt-5">
          <Button
            title="Learning progress"
            onPress={() => router.push("/progreso")}
            variant="secondary"
            style={{ marginBottom: theme.spacing.sm }}
          />
          <Button
            title="Explore the schematic map"
            onPress={() => router.push("/mapa")}
            variant="secondary"
            style={{ marginBottom: theme.spacing.sm }}
          />
          <Button
            title="Browse heritage records"
            onPress={() => router.push("/patrimonio")}
            variant="secondary"
          />
        </View>
        <View className="mt-6 flex-row justify-around">
          <Languages color={theme.colors.primary} size={19} />
          <Trophy color={theme.colors.accent} size={19} />
          <MapPin color={theme.colors.primary} size={19} />
          <Sparkles color={theme.colors.accent} size={19} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
