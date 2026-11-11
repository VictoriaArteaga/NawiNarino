import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import type { SvgProps } from "react-native-svg";

import { theme } from "../../constants/theme";

/**
 * Encabezado de Explorar (390×184). Los adornos (círculos y brújula) quedan a la derecha y la ruta punteada
 * va por debajo del texto, para que el título y el subtítulo no se crucen con ningún dibujo.
 */
export function ExploreHero(props: SvgProps) {
  return (
    <Svg viewBox="0 0 390 184" preserveAspectRatio="xMidYMin slice" width="100%" height="100%" {...props}>
      <Defs>
        <LinearGradient id="xh-hg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#DDEBDD" />
          <Stop offset="1" stopColor="#F3EBD6" />
        </LinearGradient>
      </Defs>
      <Rect width="390" height="184" fill="url(#xh-hg)" />
      <G transform="translate(122 8) scale(0.78)" fill="none" stroke="#2F6F4E" strokeWidth="1.400" opacity=".2">
        <Path d="M180 78 Q220 22 300 32 Q372 44 380 96 Q372 140 300 140 Q220 148 180 78Z" />
        <Path d="M204 80 Q236 40 298 48 Q354 58 360 96 Q352 128 298 126 Q232 132 204 80Z" />
        <Path d="M228 82 Q250 56 296 62 Q336 70 340 96 Q334 114 296 112 Q246 116 228 82Z" />
        <Path d="M252 84 Q266 70 294 76 Q318 82 320 96 Q314 102 294 100 Q264 102 252 84Z" />
      </G>
      <G transform="translate(334,60)">
        <Circle r="30" fill="none" stroke="#2F6F4E" strokeWidth="1.600" opacity=".35" />
        <Path d="M0 -26 L6 -6 L26 0 L6 6 L0 26 L-6 6 L-26 0 L-6 -6Z" fill="#C84A1F" opacity=".85" />
        <Path d="M0 -26 L6 -6 L0 0 L-6 -6Z" fill="#E8A33D" />
      </G>
      <Path d="M30 166 Q80 142 124 154 Q176 168 214 146 Q250 128 286 138" stroke="#C84A1F" strokeWidth="3" strokeDasharray="1 7" strokeLinecap="round" fill="none" opacity=".75" />
      <Circle cx="30" cy="166" r="5" fill="#2F6F4E" />
      <Circle cx="124" cy="154" r="5" fill="#E8A33D" />
      <Circle cx="214" cy="146" r="5" fill="#2E6FA8" />
      <Path d="M0 172 Q70 160 140 170 T280 168 T390 162 V184 H0Z" fill={theme.colors.canvas} />
    </Svg>
  );
}
