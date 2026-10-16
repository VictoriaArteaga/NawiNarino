import { Link } from "expo-router";
import { MapPin } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../components/Card";
import { ErrorMessage } from "../components/ErrorMessage";
import { Header } from "../components/Header";
import { Loading } from "../components/Loading";
import { MockBadge } from "../components/MockBadge";
import { useTerritories } from "../hooks/useTerritories";
import { theme } from "../constants/theme";

export default function MapScreen() {
  const query = useTerritories();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}>
        <Header title="Linguistic map" subtitle="Schematic demonstration territories; not a validated geographic distribution." backHref="/inicio" backLabel="Home" />
        {query.isPending ? (
          <Loading label="Loading demonstration markers..." />
        ) : query.isError ? (
          <ErrorMessage message={query.error.message} onRetry={() => void query.refetch()} />
        ) : query.data.length === 0 ? (
          <Card><Text style={{ color: theme.colors.muted }}>No demonstration territories are available.</Text></Card>
        ) : (
          <>
            <Card style={{ backgroundColor: theme.colors.softGreen, minHeight: 190, marginBottom: theme.spacing.lg }}>
              <Text style={{ color: theme.colors.primaryDark, fontSize: 17, fontWeight: "800" }}>Schematic view</Text>
              <Text style={{ color: theme.colors.muted, lineHeight: 21, marginTop: theme.spacing.sm }}>
                Geographic coordinates are intentionally omitted until verified data is available.
              </Text>
              <View className="mt-5 flex-row flex-wrap">
                {query.data.map((territory) => (
                  <Link
                    key={territory.id}
                    href={{ pathname: "/territorios/[territoryId]", params: { territoryId: String(territory.id) } }}
                    asChild
                  >
                    <Pressable
                      accessibilityRole="link"
                      accessibilityLabel={`Open ${territory.name}`}
                      style={{ alignItems: "center", margin: theme.spacing.sm }}
                    >
                      <MapPin color={theme.colors.danger} fill={theme.colors.danger} size={30} />
                      <Text style={{ color: theme.colors.ink, fontSize: 12, marginTop: 3 }}>{territory.name}</Text>
                    </Pressable>
                  </Link>
                ))}
              </View>
            </Card>
            {query.data.map((territory) => (
              <Link
                key={territory.id}
                href={{ pathname: "/territorios/[territoryId]", params: { territoryId: String(territory.id) } }}
                asChild
              >
                <Pressable accessibilityRole="link">
                  <Card style={{ marginBottom: theme.spacing.md }}>
                    <View className="flex-row items-center">
                      <MapPin color={theme.colors.primary} size={21} />
                      <Text style={{ color: theme.colors.ink, fontSize: 17, fontWeight: "800", marginLeft: theme.spacing.sm }}>
                        {territory.name}
                      </Text>
                    </View>
                    <Text style={{ color: theme.colors.muted, marginTop: theme.spacing.sm }}>{territory.region}</Text>
                    <MockBadge />
                  </Card>
                </Pressable>
              </Link>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
