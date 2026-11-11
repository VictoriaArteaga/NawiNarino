import Svg, { Circle, Defs, Path, Pattern, Rect } from "react-native-svg";
import type { SvgProps } from "react-native-svg";

const TILE_WIDTH = 72;
const TILE_HEIGHT = 54;

/**
 * Patrón Ñawi: franja verde con rombos dorados y terracota unidos por puntos crema.
 * Se repite en mosaico, así que se ve igual en cualquier ancho de pantalla.
 */
export function PatternArt(props: SvgProps) {
  return (
    <Svg width="100%" height="100%" {...props}>
      <Defs>
        <Pattern
          id="nawi-pattern"
          patternUnits="userSpaceOnUse"
          width={TILE_WIDTH}
          height={TILE_HEIGHT}
        >
          <Rect width={TILE_WIDTH} height={TILE_HEIGHT} fill="#1F4D3A" />
          <Path d="M0 27 l18 -14 l18 14 l-18 14z" fill="#E8A33D" />
          <Path d="M36 27 l18 -14 l18 14 l-18 14z" fill="#C84A1F" />
          <Circle cx="36" cy="27" r="3" fill="#F5EDE0" />
          <Circle cx="0" cy="27" r="3" fill="#F5EDE0" />
          <Circle cx="72" cy="27" r="3" fill="#F5EDE0" />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#nawi-pattern)" />
    </Svg>
  );
}
