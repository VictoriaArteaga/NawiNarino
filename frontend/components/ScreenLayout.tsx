import type { PropsWithChildren } from "react";
import { ScrollView, View, type StyleProp, type ViewStyle } from "react-native";

import { theme } from "../constants/theme";
import { BottomNav, useNavHeight, type NavKey } from "./BottomNav";
import { PatternBand } from "./PatternBand";

interface ScreenLayoutProps extends PropsWithChildren {
  /** Which bottom-navigation tab is highlighted. Omit to hide the navigation. */
  nav?: NavKey;
  navColor?: string;
  /** Shows the "patrón Ñawi" band above the navigation (as in the designs). */
  band?: boolean;
  background?: string;
  contentStyle?: StyleProp<ViewStyle>;
  /** Extra space under the content (px). */
  bottomSpace?: number;
}

/**
 * Standard screen frame: scrollable content, optional pattern band and bottom
 * navigation fixed to the bottom of the screen.
 */
export function ScreenLayout({
  children,
  nav,
  navColor,
  band = false,
  background = theme.colors.canvas,
  contentStyle,
  bottomSpace = 16,
}: ScreenLayoutProps) {
  const navHeight = useNavHeight();
  const reserved = nav ? navHeight : 0;
  const bandSpace = nav && band ? theme.layout.bandHeight : 0;

  return (
    <View style={{ backgroundColor: background, flex: 1 }}>
      <ScrollView
        contentContainerStyle={[
          { paddingBottom: reserved + bandSpace + bottomSpace },
          contentStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      {nav && band ? (
        <View
          pointerEvents="none"
          style={{ bottom: reserved, left: 0, position: "absolute", right: 0 }}
        >
          <PatternBand />
        </View>
      ) : null}
      {nav ? <BottomNav active={nav} activeColor={navColor} /> : null}
    </View>
  );
}
