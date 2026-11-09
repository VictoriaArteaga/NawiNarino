import { useId, type PropsWithChildren } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

interface GradientBoxProps extends PropsWithChildren {
  /** Two or more color stops, from start to end. */
  colors: string[];
  /** Gradient direction. "tr" = bottom-left → top-right (as in the language cards). */
  direction?: "tr" | "br" | "b" | "r";
  style?: StyleProp<ViewStyle>;
}

const vectors = {
  tr: { x1: "0", y1: "1", x2: "1", y2: "0" },
  br: { x1: "0", y1: "0", x2: "1", y2: "1" },
  b: { x1: "0", y1: "0", x2: "0", y2: "1" },
  r: { x1: "0", y1: "0", x2: "1", y2: "0" },
} as const;

/** A View with a linear-gradient background, drawn with react-native-svg. */
export function GradientBox({
  colors,
  direction = "br",
  style,
  children,
}: GradientBoxProps) {
  const id = `gb${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const v = vectors[direction];

  return (
    <View style={[{ overflow: "hidden", zIndex: 0 }, style]}>
      <Svg
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { zIndex: -1 }]}
        width="100%"
        height="100%"
      >
        <Defs>
          <LinearGradient id={id} x1={v.x1} y1={v.y1} x2={v.x2} y2={v.y2}>
            {colors.map((color, index) => (
              <Stop
                key={`${color}-${index}`}
                offset={String(index / Math.max(1, colors.length - 1))}
                stopColor={color}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
      {children}
    </View>
  );
}
