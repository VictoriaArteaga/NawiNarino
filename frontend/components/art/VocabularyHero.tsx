import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop, Use } from "react-native-svg";
import type { SvgProps } from "react-native-svg";

/* Generated from the approved Ñawi-Nariño design artboards. */
export function VocabularyHero(props: SvgProps) {
  return (
    <Svg viewBox="0 0 390 168" preserveAspectRatio="xMidYMin slice" width="100%" height="100%" {...props}>
      <Defs>
        <LinearGradient id="vh-sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#CFE3D2" />
          <Stop offset=".7" stopColor="#EEF0DA" />
          <Stop offset="1" stopColor="#F6EBD2" />
        </LinearGradient>
        <RadialGradient id="vh-sun" cx=".5" cy=".5" r=".5">
          <Stop offset="0" stopColor="#FFE7A8" stopOpacity=".95" />
          <Stop offset="1" stopColor="#FFE7A8" stopOpacity="0" />
        </RadialGradient>
        <G id="vh-palm">
          <Path d="M0 0 Q3 -22 0 -44" stroke="#2F5A43" strokeWidth="3.200" fill="none" strokeLinecap="round" />
          <G stroke="#2C6049" strokeWidth="3" fill="none" strokeLinecap="round">
            <Path d="M0 -44 Q16 -58 34 -46" />
            <Path d="M0 -44 Q-16 -58 -34 -46" />
            <Path d="M0 -44 Q12 -64 26 -62" />
            <Path d="M0 -44 Q-12 -64 -26 -62" />
            <Path d="M0 -44 Q2 -66 0 -72" />
            <Path d="M0 -44 Q22 -48 38 -34" />
            <Path d="M0 -44 Q-22 -48 -38 -34" />
          </G>
        </G>
        <G id="vh-leaf">
          <Path d="M0 0 C26 -44 92 -58 140 -22 C104 -12 56 8 0 0Z" fill="#2E6B4E" />
          <Path d="M4 -2 C40 -22 86 -30 128 -22" stroke="#9BC7A0" strokeWidth="2" fill="none" strokeLinecap="round" />
          <Path d="M30 -12 l8 14 M54 -20 l10 12 M80 -26 l10 10" stroke="#5E9A79" strokeWidth="1.600" strokeLinecap="round" />
        </G>
      </Defs>
      <Rect width="390" height="168" fill="url(#vh-sky)" />
      <Circle cx="300" cy="50" r="80" fill="url(#vh-sun)" />
      <G fill="#fff" opacity=".6">
        <Ellipse cx="82" cy="34" rx="44" ry="6" />
        <Ellipse cx="318" cy="22" rx="38" ry="5" />
      </G>
      <Path d="M0 92 Q50 64 100 84 T200 76 T300 86 T390 72 V168 H0Z" fill="#A2C8AE" />
      <Ellipse cx="120" cy="100" rx="150" ry="8" fill="#fff" opacity=".5" />
      <Path d="M0 116 Q70 88 140 108 T270 104 T390 98 V168 H0Z" fill="#74AC8C" />
      <Path d="M0 138 Q80 114 170 134 T390 124 V168 H0Z" fill="#4C8B6C" />
      <Use href="#vh-palm" transform="translate(64,140) scale(.55)" />
      <Use href="#vh-palm" transform="translate(104,144) scale(.44)" />
      <Use href="#vh-palm" transform="translate(262,134) scale(.5)" />
      <Path d="M0 150 Q60 136 108 154 L124 168 H0Z" fill="#2F6B4E" />
      <Use href="#vh-leaf" transform="translate(-6,166) rotate(-30) scale(.8)" />
      <Path d="M390 128 Q350 120 306 130" stroke="#6B4A2E" strokeWidth="6" fill="none" strokeLinecap="round" />
      <G transform="translate(338,76) scale(.8)">
        <Ellipse cx="0" cy="22" rx="15" ry="22" fill="#1B1B1B" />
        <Ellipse cx="-3" cy="18" rx="8" ry="12" fill="#F4ECDD" />
        <Circle cx="-4" cy="-4" r="11" fill="#1B1B1B" />
        <Path d="M-12 -8 Q-44 -12 -52 2 Q-34 12 -12 2Z" fill="#E8A33D" />
        <Path d="M-12 -8 Q-34 -10 -52 2 Q-32 -2 -12 -2Z" fill="#C84A1F" />
        <Circle cx="-7" cy="-6" r="3.600" fill="#fff" />
        <Circle cx="-7.500" cy="-6" r="1.800" fill="#000" />
        <Path d="M4 42 l10 18 l-18 -8Z" fill="#1B1B1B" />
      </G>
      <Path d="M0 156 Q70 146 140 154 T280 152 T390 146 V168 H0Z" fill="#F5EDE0" />
    </Svg>
  );
}
