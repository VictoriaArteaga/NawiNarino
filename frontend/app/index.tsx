import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { BrandEmblem } from "../components/art/BrandEmblem";
import { WelcomeScene } from "../components/art/WelcomeScene";
import { Button } from "../components/Button";
import { PatternBand } from "../components/PatternBand";
import { Portrait } from "../components/Portrait";
import { T } from "../components/T";
import { getLanguageTheme } from "../constants/languages";
import { shadows, theme } from "../constants/theme";
import { useAuthStore } from "../store/authStore";

const peoples = ["Awá Pit", "Inga", "Nasa Yuwe", "Cofán"] as const;

export default function WelcomeScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.token !== null);
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 0);

  return (
    <View style={{ backgroundColor: theme.colors.canvas, flex: 1 }}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <WelcomeScene preserveAspectRatio="xMidYMax slice" />
      </View>

      {/* Brand lockup */}
      <View
        style={{
          alignItems: "center",
          paddingTop: Math.max(insets.top, 24) + 38,
        }}
      >
        <View style={{ height: 76, width: 150 }}>
          <BrandEmblem />
        </View>
        <T
          accessibilityRole="header"
          f="display"
          w={800}
          s={72}
          lh={76}
          ls={2}
          c={theme.colors.primaryDark}
          style={{ marginTop: 4 }}
        >
          ÑAWI
        </T>
        <T
          f="display"
          w={500}
          s={20}
          ls={9}
          c={theme.colors.primaryDark}
          style={{ marginTop: 8, paddingLeft: 9 }}
        >
          NARIÑO
        </T>
        <View style={{ height: 12, marginTop: 18, width: 150 }}>
          <Svg width="150" height="12" viewBox="0 0 150 12">
            <Path
              d="M0 6 H58 M92 6 H150"
              stroke="#C84A1F"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity={0.7}
            />
            <Path d="M75 0 L81 6 L75 12 L69 6Z" fill="#E8A33D" />
            <Path
              d="M62 6 l3 -3 l3 3 l-3 3Z M82 6 l3 -3 l3 3 l-3 3Z"
              fill="#C84A1F"
            />
          </Svg>
        </View>
        <T italic w={600} s={20} c={theme.colors.ink} style={{ marginTop: 12 }}>
          “Territorio que habla”
        </T>
        <T
          s={15.5}
          lh={23}
          align="center"
          c={theme.colors.body}
          style={{ marginTop: 14, paddingHorizontal: 40 }}
        >
          {"Lenguas indígenas,\nterritorios vivos,\nconocimiento sin límites."}
        </T>
      </View>

      {/* The four languages */}
      <View
        style={{
          alignItems: "center",
          bottom: 154 + bottom,
          left: 0,
          position: "absolute",
          right: 0,
        }}
      >
        <View
          style={[
            {
              alignItems: "center",
              backgroundColor: "rgba(251,243,230,0.94)",
              borderRadius: 22,
              flexDirection: "row",
              gap: 12,
              height: 64,
              paddingHorizontal: 14,
              width: 304,
            },
            shadows.float,
          ]}
        >
          <View style={{ flexDirection: "row" }}>
            {(["Awá Pit", "Inga", "Nasa Yuwe", "A'ingae"] as const).map(
              (name, index) => (
                <View key={name} style={{ marginLeft: index === 0 ? 0 : -10 }}>
                  <Portrait
                    language={getLanguageTheme(name)}
                    size={40}
                    ring={3}
                    accessibilityLabel={`Retrato del pueblo ${name}`}
                  />
                </View>
              ),
            )}
          </View>
          <View style={{ flex: 1 }}>
            <T f="display" w={800} s={15} c={theme.colors.primaryDark}>
              4 lenguas vivas
            </T>
            <T s={12} c="#4B554F" numberOfLines={1}>
              {peoples.join(" · ")}
            </T>
          </View>
        </View>
      </View>

      {/* Call to action */}
      <View
        style={{
          alignItems: "center",
          bottom: 72 + bottom,
          left: 0,
          position: "absolute",
          right: 0,
        }}
      >
        {isAuthenticated ? (
          <Button
            onPress={() => router.replace("/inicio")}
            style={[{ width: 288 }, shadows.float]}
            title="Continuar"
          />
        ) : (
          <View style={{ flexDirection: "row", gap: 10, width: 288 }}>
            <Button
              onPress={() => router.push("/login")}
              style={[{ flex: 1, paddingHorizontal: 8 }, shadows.float]}
              title="Iniciar sesión"
            />
            <Button
              onPress={() => router.push("/registro")}
              style={[{ flex: 1, paddingHorizontal: 8 }, shadows.float]}
              title="Registrarse"
              variant="outline"
            />
          </View>
        )}
      </View>

      <View
        style={{
          backgroundColor: theme.colors.canvas,
          bottom: 0,
          left: 0,
          paddingBottom: bottom,
          position: "absolute",
          right: 0,
        }}
      >
        <PatternBand />
      </View>
    </View>
  );
}
