import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop, Use } from "react-native-svg";
import type { SvgProps } from "react-native-svg";

/* Generated from the approved Ñawi-Nariño design artboards. */
export function AwaHero(props: SvgProps) {
  return (
    <Svg viewBox="0 0 390 240" preserveAspectRatio="xMidYMin slice" width="100%" height="100%" {...props}>
      <Defs>
        <LinearGradient id="aw-sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#CFE3D2" />
          <Stop offset=".6" stopColor="#EEF0DA" />
          <Stop offset="1" stopColor="#F6EBD2" />
        </LinearGradient>
        <RadialGradient id="aw-sun" cx=".5" cy=".5" r=".5">
          <Stop offset="0" stopColor="#FFE7A8" stopOpacity=".95" />
          <Stop offset="1" stopColor="#FFE7A8" stopOpacity="0" />
        </RadialGradient>
        <G id="aw-palm">
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
        <G id="aw-leaf">
          <Path d="M0 0 C26 -44 92 -58 140 -22 C104 -12 56 8 0 0Z" fill="#2E6B4E" />
          <Path d="M4 -2 C40 -22 86 -30 128 -22" stroke="#9BC7A0" strokeWidth="2" fill="none" strokeLinecap="round" />
          <Path d="M30 -12 l8 14 M54 -20 l10 12 M80 -26 l10 10" stroke="#5E9A79" strokeWidth="1.600" strokeLinecap="round" />
        </G>
      </Defs>
      <Rect width="390" height="240" fill="url(#aw-sky)" />
      <Circle cx="300" cy="64" r="86" fill="url(#aw-sun)" />
      <G fill="#fff" opacity=".6">
        <Ellipse cx="80" cy="46" rx="46" ry="7" />
        <Ellipse cx="320" cy="34" rx="40" ry="6" />
      </G>
      <Path d="M0 124 Q50 90 100 112 T200 102 T300 114 T390 98 V240 H0Z" fill="#A2C8AE" />
      <Ellipse cx="120" cy="134" rx="150" ry="9" fill="#fff" opacity=".55" />
      <Path d="M0 152 Q70 118 140 142 T270 138 T390 130 V240 H0Z" fill="#74AC8C" />
      <Ellipse cx="290" cy="162" rx="130" ry="8" fill="#fff" opacity=".45" />
      <Path d="M0 178 Q80 150 170 174 T390 162 V240 H0Z" fill="#4C8B6C" />
      <Path d="M214 162 Q238 178 212 198 Q184 214 204 240 H130 Q154 214 162 196 Q184 176 170 164Z" fill="#8CC8CF" />
      <Path d="M200 176 Q214 184 204 196 M178 208 Q168 220 176 232" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".55" />
      <Use href="#aw-palm" transform="translate(62,176) scale(.62)" />
      <Use href="#aw-palm" transform="translate(98,182) scale(.5)" />
      <Use href="#aw-palm" transform="translate(268,172) scale(.55)" />
      <Use href="#aw-palm" transform="translate(344,166) scale(.7)" />
      <Path d="M0 204 Q60 184 124 212 L146 240 H0Z" fill="#2F6B4E" />
      <Path d="M390 210 Q336 196 290 222 L276 240 H390Z" fill="#2B6148" />
      <Use href="#aw-leaf" transform="translate(-6,236) rotate(-30)" />
      <Use href="#aw-leaf" transform="translate(-10,240) rotate(-62) scale(.8)" />
      <G transform="translate(394,236) scale(-1,1)">
        <Use href="#aw-leaf" transform="rotate(-24) scale(.9)" />
      </G>
      <Path d="M0 238 C14 216 40 206 70 208 C54 224 30 236 0 240Z" fill="#D9702F" opacity=".95" />
      <Path d="M0 240 C20 226 44 220 66 222 C48 234 24 240 0 240Z" fill="#E8A33D" />
      <Path d="M390 188 Q350 178 296 190" stroke="#6B4A2E" strokeWidth="7" fill="none" strokeLinecap="round" />
      <G transform="translate(332,128)">
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
      <Path d="M0 226 Q70 214 140 224 T280 222 T390 214 V240 H0Z" fill="#F5EDE0" />
    </Svg>
  );
}
