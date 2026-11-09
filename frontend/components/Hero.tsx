import type { PropsWithChildren, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Distance from the top edge where header buttons sit (below the status bar). */
export function useHeaderTop() {
  const { top } = useSafeAreaInsets();
  return Math.max(top, 24) + 6;
}

/** Rendered height of a hero whose design height is `height` (adds the status-bar extra). */
export function useHeroHeight(height: number) {
  const { top } = useSafeAreaInsets();
  return height + Math.max(0, top - 24);
}

interface HeroProps extends PropsWithChildren {
  /** Design height of the illustration (px) at 390 px of width. */
  height: number;
  /** The artwork, e.g. <AwaHero />. */
  art: ReactNode;
}

/**
 * Full-bleed illustrated header. The artwork fills the frame (slice) and the
 * children are overlaid (buttons, titles).
 */
export function Hero({ height, art, children }: HeroProps) {
  const { top } = useSafeAreaInsets();
  const extra = Math.max(0, top - 24);

  return (
    <View style={{ height: height + extra, width: "100%" }}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {art}
      </View>
      {children}
    </View>
  );
}
