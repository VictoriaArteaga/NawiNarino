import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop, Use } from "react-native-svg";
import type { SvgProps } from "react-native-svg";

/* Generated from the approved Ñawi-Nariño design artboards. */
export function ActivityScene(props: SvgProps) {
  return (
    <Svg viewBox="0 0 350 168" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" {...props}>
      <Defs>
        <LinearGradient id="as-sk" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#CFE3D2" />
          <Stop offset=".7" stopColor="#EEF0DA" />
          <Stop offset="1" stopColor="#F6EBD2" />
        </LinearGradient>
        <RadialGradient id="as-sn" cx=".5" cy=".5" r=".5">
          <Stop offset="0" stopColor="#FFE7A8" stopOpacity=".95" />
          <Stop offset="1" stopColor="#FFE7A8" stopOpacity="0" />
        </RadialGradient>
        <G id="as-lf">
          <Path d="M0 0 C26 -44 92 -58 140 -22 C104 -12 56 8 0 0Z" fill="#2E6B4E" />
          <Path d="M4 -2 C40 -22 86 -30 128 -22" stroke="#9BC7A0" strokeWidth="2" fill="none" strokeLinecap="round" />
          <Path d="M30 -12 l8 14 M54 -20 l10 12 M80 -26 l10 10" stroke="#5E9A79" strokeWidth="1.600" strokeLinecap="round" />
        </G>
      </Defs>
      <Rect width="350" height="168" fill="url(#as-sk)" />
      <Circle cx="268" cy="46" r="70" fill="url(#as-sn)" />
      <Path d="M0 96 Q40 70 90 88 T190 80 T290 86 T350 72 V168 H0Z" fill="#A2C8AE" />
      <Ellipse cx="170" cy="100" rx="190" ry="7" fill="#fff" opacity=".5" />
      <Path d="M0 122 Q70 98 150 118 T350 106 V168 H0Z" fill="#74AC8C" />
      <Path d="M0 144 Q80 124 170 142 T350 132 V168 H0Z" fill="#4C8B6C" />
      <Path d="M40 0 Q52 30 40 58 M300 0 Q290 34 304 64" stroke="#3E7A5B" strokeWidth="2.500" fill="none" strokeLinecap="round" />
      <G fill="#3E7A5B">
        <Ellipse cx="42" cy="30" rx="7" ry="3.500" transform="rotate(30 42 30)" />
        <Ellipse cx="44" cy="52" rx="7" ry="3.500" transform="rotate(-30 44 52)" />
        <Ellipse cx="294" cy="34" rx="7" ry="3.500" transform="rotate(-30 294 34)" />
        <Ellipse cx="302" cy="58" rx="7" ry="3.500" transform="rotate(30 302 58)" />
      </G>
      <Use href="#as-lf" transform="translate(-8,168) rotate(-36) scale(.95)" />
      <Use href="#as-lf" transform="translate(-12,172) rotate(-70) scale(.8)" />
      <G transform="translate(358,168) scale(-1,1)">
        <Use href="#as-lf" transform="rotate(-30) scale(.95)" />
      </G>
      <Path d="M16 150 C26 128 46 122 66 126 C56 142 40 152 16 156Z" fill="#C84A1F" />
      <Path d="M16 156 C30 142 48 138 66 140 C54 152 36 158 16 160Z" fill="#E8A33D" />
      <Path d="M18 134 Q150 112 342 136" stroke="#6B4A2E" strokeWidth="9" fill="none" strokeLinecap="round" />
      <G transform="translate(222,52) scale(1.85)">
        <Ellipse cx="0" cy="22" rx="15" ry="22" fill="#1B1B1B" />
        <Ellipse cx="-3" cy="18" rx="8" ry="12" fill="#F4ECDD" />
        <Circle cx="-4" cy="-4" r="11" fill="#1B1B1B" />
        <Path d="M-12 -8 Q-44 -12 -52 2 Q-34 12 -12 2Z" fill="#E8A33D" />
        <Path d="M-12 -8 Q-34 -10 -52 2 Q-32 -2 -12 -2Z" fill="#C84A1F" />
        <Circle cx="-7" cy="-6" r="3.600" fill="#fff" />
        <Circle cx="-7.500" cy="-6" r="1.800" fill="#000" />
        <Path d="M4 42 l10 18 l-18 -8Z" fill="#1B1B1B" />
        <Path d="M-6 42 l-2 10 l8 -4Z" fill="#C84A1F" />
      </G>
    </Svg>
  );
}
