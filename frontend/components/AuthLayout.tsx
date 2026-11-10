import type { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandEmblem } from "./art/BrandEmblem";
import { PatternBand } from "./PatternBand";
import { T } from "./T";
import { theme } from "../constants/theme";

interface AuthLayoutProps extends PropsWithChildren {
  title: string;
  subtitle: string;
}

const PEOPLES = ["Awá Pit", "Inga", "Nasa Yuwe", "A'ingae"];

/**
 * Marco común de las pantallas de acceso: encabezado verde con la marca y, encima,
 * una hoja crema con el formulario. La franja de patrón cierra la pantalla.
 */
export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ backgroundColor: theme.colors.primaryDark, flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Marca */}
        <View
          style={{
            alignItems: "center",
            paddingBottom: 46,
            paddingTop: Math.max(insets.top, 24) + 14,
          }}
        >
          <View accessibilityLabel="Emblema de ÑAWI" accessibilityRole="image" style={{ height: 66, width: 120 }}>
            <BrandEmblem onDark />
          </View>
          <T
            accessibilityRole="header"
            f="display"
            w={800}
            s={34}
            lh={38}
            ls={2.5}
            c={theme.colors.surface}
            style={{ marginTop: 6 }}
          >
            ÑAWI
          </T>
          <T f="display" w={500} s={12} ls={7} c={theme.colors.gold} style={{ marginTop: 2, paddingLeft: 7 }}>
            NARIÑO
          </T>
          <T s={12.5} c="#B9CDBF" style={{ marginTop: 10 }}>
            {PEOPLES.join("  ·  ")}
          </T>
        </View>

        {/* Hoja del formulario */}
        <View
          style={{
            backgroundColor: theme.colors.canvas,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            flexGrow: 1,
            marginTop: -26,
          }}
        >
          <View
            style={{
              alignSelf: "center",
              maxWidth: 460,
              paddingHorizontal: 24,
              paddingTop: 28,
              width: "100%",
            }}
          >
            <T accessibilityRole="header" f="display" w={800} s={26} lh={31} c={theme.colors.ink}>
              {title}
            </T>
            <T s={15} lh={22} c={theme.colors.body} style={{ marginTop: 4 }}>
              {subtitle}
            </T>
            {children}
          </View>

          <View style={{ flexGrow: 1, justifyContent: "flex-end", paddingTop: 28 }}>
            <T italic w={600} s={14} align="center" c={theme.colors.primary} style={{ marginBottom: 10 }}>
              “Territorio que habla”
            </T>
            <View style={{ backgroundColor: theme.colors.canvas, paddingBottom: Math.max(insets.bottom, 0) }}>
              <PatternBand />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
