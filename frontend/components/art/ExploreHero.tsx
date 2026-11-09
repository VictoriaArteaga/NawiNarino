import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import type { SvgProps } from "react-native-svg";

/* Generated from the approved Ñawi-Nariño design artboards. */
export function ExploreHero(props: SvgProps) {
  return (
    <Svg viewBox="0 0 390 150" preserveAspectRatio="xMidYMin slice" width="100%" height="100%" {...props}>
      <Defs>
        <LinearGradient id="xh-hg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#DDEBDD" />
          <Stop offset="1" stopColor="#F3EBD6" />
        </LinearGradient>
      </Defs>
      <Rect width="390" height="150" fill="url(#xh-hg)" />
      <G fill="none" stroke="#2F6F4E" strokeWidth="1.400" opacity=".2">
        <Path d="M180 78 Q220 22 300 32 Q372 44 380 96 Q372 140 300 140 Q220 148 180 78Z" />
        <Path d="M204 80 Q236 40 298 48 Q354 58 360 96 Q352 128 298 126 Q232 132 204 80Z" />
        <Path d="M228 82 Q250 56 296 62 Q336 70 340 96 Q334 114 296 112 Q246 116 228 82Z" />
        <Path d="M252 84 Q266 70 294 76 Q318 82 320 96 Q314 102 294 100 Q264 102 252 84Z" />
      </G>
      <G transform="translate(316,72)">
        <Circle r="34" fill="none" stroke="#2F6F4E" strokeWidth="1.600" opacity=".35" />
        <Path d="M0 -30 L7 -7 L30 0 L7 7 L0 30 L-7 7 L-30 0 L-7 -7Z" fill="#C84A1F" opacity=".85" />
        <Path d="M0 -30 L7 -7 L0 0 L-7 -7Z" fill="#E8A33D" />
      </G>
      <Path d="M30 126 Q80 100 124 112 Q176 126 214 100 Q250 80 286 92" stroke="#C84A1F" strokeWidth="3" strokeDasharray="1 7" strokeLinecap="round" fill="none" opacity=".75" />
      <Circle cx="30" cy="126" r="5" fill="#2F6F4E" />
      <Circle cx="124" cy="112" r="5" fill="#E8A33D" />
      <Circle cx="214" cy="100" r="5" fill="#2E6FA8" />
      <Path d="M0 136 Q70 124 140 134 T280 132 T390 126 V150 H0Z" fill="#F5EDE0" />
    </Svg>
  );
}
