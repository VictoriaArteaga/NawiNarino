import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop, Use } from "react-native-svg";
import type { SvgProps } from "react-native-svg";

import { theme } from "../../constants/theme";
/* Generated from the approved Ñawi-Nariño design artboards. */
export function NasaHero(props: SvgProps) {
  return (
    <Svg viewBox="0 0 390 240" preserveAspectRatio="xMidYMin slice" width="100%" height="100%" {...props}>
      <Defs>
        <LinearGradient id="ns-sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#4C86B8" />
          <Stop offset=".55" stopColor="#9CC6DE" />
          <Stop offset="1" stopColor="#EAF0EC" />
        </LinearGradient>
        <LinearGradient id="ns-lake" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#6FBCC2" />
          <Stop offset="1" stopColor="#3F8FA6" />
        </LinearGradient>
        <G id="ns-fr">
          <Rect x="-3.500" y="0" width="7" height="30" rx="3" fill="#9B8657" />
          <Path d="M-3 8 l-5 3 M3 14 l5 3" stroke="#B9A56F" strokeWidth="2" strokeLinecap="round" />
          <G fill="#8FA84C">
            <Path d="M0 0 L-3 -22 L0 -29 L3 -22Z" transform="rotate(-72)" />
            <Path d="M0 0 L-3 -22 L0 -29 L3 -22Z" transform="rotate(-48)" />
            <Path d="M0 0 L-3 -22 L0 -29 L3 -22Z" transform="rotate(-24)" />
            <Path d="M0 0 L-3 -24 L0 -31 L3 -24Z" />
            <Path d="M0 0 L-3 -22 L0 -29 L3 -22Z" transform="rotate(24)" />
            <Path d="M0 0 L-3 -22 L0 -29 L3 -22Z" transform="rotate(48)" />
            <Path d="M0 0 L-3 -22 L0 -29 L3 -22Z" transform="rotate(72)" />
          </G>
          <G fill="#DCDB92">
            <Path d="M0 -22 L-1.500 -28 L0 -32 L1.500 -28Z" />
          </G>
        </G>
      </Defs>
      <Rect width="390" height="240" fill="url(#ns-sky)" />
      <Circle cx="64" cy="56" r="18" fill="#FFF6DA" opacity=".9" />
      <Circle cx="64" cy="56" r="34" fill="#FFF6DA" opacity=".25" />
      <G fill="#fff" opacity=".7">
        <Ellipse cx="320" cy="44" rx="40" ry="7" />
        <Ellipse cx="120" cy="86" rx="50" ry="6" />
        <Ellipse cx="250" cy="116" rx="60" ry="6" />
      </G>
      <Path d="M130 176 L226 70 L246 90 L270 52 L292 84 L312 66 L390 176Z" fill="#7C97B5" />
      <Path d="M270 52 L292 84 L280 80 L270 98 L258 80 L246 90Z" fill="#fff" />
      <Path d="M226 70 L246 90 L236 88 L228 100 L218 86Z" fill="#fff" />
      <Path d="M312 66 L326 86 L316 84 L310 94 L302 82Z" fill="#fff" />
      <Path d="M270 52 L292 84 L312 66 L390 176 L300 176Z" fill="#5F7C9C" opacity=".55" />
      <Path d="M0 142 L48 112 L96 138 L150 108 L210 140 L270 118 L330 142 L390 118 V240 H0Z" fill="#6F93A6" />
      <Ellipse cx="200" cy="154" rx="190" ry="8" fill="#fff" opacity=".5" />
      <Path d="M0 166 Q70 142 150 160 T280 156 T390 152 V240 H0Z" fill="#7FA08C" />
      <Path d="M0 182 Q90 160 190 180 T390 170 V240 H0Z" fill="#B9BB6C" />
      <Path d="M44 198 Q90 176 170 188 Q250 196 330 186 Q370 182 372 206 Q300 232 200 228 Q96 230 44 198Z" fill="url(#ns-lake)" />
      <Path d="M226 190 L246 190 L262 196 L214 196Z" fill="#fff" opacity=".35" />
      <G stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".5">
        <Path d="M80 204 H150 M180 212 H260 M280 200 H340 M110 218 H190" />
      </G>
      <G stroke="#C9B55A" strokeWidth="2" strokeLinecap="round" fill="none">
        <Path d="M12 240 l-3 -26 M20 240 l2 -30 M28 240 l7 -24 M36 240 l-1 -20 M352 240 l-4 -28 M362 240 l3 -26 M372 240 l8 -22 M382 240 l-2 -26" />
      </G>
      <Use href="#ns-fr" transform="translate(42,214) scale(.9)" />
      <Use href="#ns-fr" transform="translate(344,216) scale(1)" />
      <Use href="#ns-fr" transform="translate(316,224) scale(.7)" />
      <G fill="#2B2A26" transform="translate(120,60) scale(1.3)">
        <Path d="M0 0 Q10 -7 24 -1 Q12 -3 2 4 Q-10 -3 -24 -1 Q-10 -7 0 0Z" />
      </G>
      <Path d="M0 226 Q70 214 140 224 T280 222 T390 214 V240 H0Z" fill={theme.colors.canvas} />
    </Svg>
  );
}
