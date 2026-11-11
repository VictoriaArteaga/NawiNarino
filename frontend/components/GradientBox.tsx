import { useId, useState, type PropsWithChildren } from "react";
import { View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";
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

/**
 * A View with a linear-gradient background, drawn with react-native-svg.
 *
 * El degradado se dibuja con el tamaño en píxeles que mide la propia tarjeta (onLayout) y se actualiza si
 * cambia (por ejemplo, cuando el texto salta de línea). Con `width="100%"` el SVG nativo de Android no
 * seguía el tamaño de la tarjeta y el texto quedaba fuera del color. El color de base evita que la sombra
 * (elevation) se dibuje como un rectángulo vacío y sirve de respaldo mientras se mide.
 */
export function GradientBox({
  colors,
  direction = "br",
  style,
  children,
}: GradientBoxProps) {
  const id = `gb${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const v = vectors[direction];
  const [box, setBox] = useState({ width: 0, height: 0 });

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setBox((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  };

  return (
    <View onLayout={onLayout} style={[{ backgroundColor: colors[0], overflow: "hidden" }, style]}>
      {box.width > 0 && box.height > 0 ? (
        <Svg
          pointerEvents="none"
          style={{ left: 0, position: "absolute", top: 0 }}
          width={box.width}
          height={box.height}
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
          <Rect width={box.width} height={box.height} fill={`url(#${id})`} />
        </Svg>
      ) : null}
      {children}
    </View>
  );
}
