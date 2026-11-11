import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop, Use } from "react-native-svg";
import type { SvgProps } from "react-native-svg";

import { theme } from "../../constants/theme";
/* Generated from the approved Ñawi-Nariño design artboards. */
export function ProfileHero(props: SvgProps) {
  return (
    <Svg viewBox="0 0 390 190" preserveAspectRatio="xMidYMin slice" width="100%" height="100%" {...props}>
      <Defs>
        <LinearGradient id="pf-sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#CFE3D2" />
          <Stop offset=".6" stopColor="#F3EBCB" />
          <Stop offset="1" stopColor="#F9DFB4" />
        </LinearGradient>
        <RadialGradient id="pf-sun" cx=".5" cy=".5" r=".5">
          <Stop offset="0" stopColor="#FFE7A8" stopOpacity=".95" />
          <Stop offset="1" stopColor="#FFE7A8" stopOpacity="0" />
        </RadialGradient>
        <G id="pf-hs">
          <Rect x="-10" y="-12" width="20" height="14" fill="#F4ECDD" />
          <Path d="M-13 -12 L0 -22 L13 -12Z" fill="#C84A1F" />
          <Rect x="-3" y="-6" width="6" height="8" fill="#6B4A2E" />
        </G>
      </Defs>
      <Rect width="390" height="190" fill="url(#pf-sky)" />
      <Circle cx="70" cy="74" r="84" fill="url(#pf-sun)" />
      <Circle cx="70" cy="78" r="20" fill="#FFF0C4" />
      <G fill="#fff" opacity=".6">
        <Ellipse cx="290" cy="40" rx="44" ry="6" />
        <Ellipse cx="190" cy="62" rx="36" ry="5" />
      </G>
      <Path d="M0 112 Q60 80 130 102 T260 94 T390 84 V190 H0Z" fill="#A2C8AE" />
      <Path d="M150 190 L250 80 L282 104 L316 72 L390 150 V190Z" fill="#7FA6A0" />
      <Path d="M0 142 Q90 114 190 138 T390 124 V190 H0Z" fill="#8DAE52" />
      <Path d="M0 158 Q90 136 190 156 T390 146 V190 H0Z" fill="#D2BC63" />
      <Path d="M0 172 Q90 156 190 170 T390 164 V190 H0Z" fill="#6E9A45" />
      <G stroke="#fff" strokeWidth="1.400" opacity=".35" fill="none">
        <Path d="M0 142 Q90 114 190 138 T390 124" />
        <Path d="M0 158 Q90 136 190 156 T390 146" />
      </G>
      <Use href="#pf-hs" transform="translate(236,136)" />
      <Use href="#pf-hs" transform="translate(268,142) scale(.9)" />
      <Use href="#pf-hs" transform="translate(300,132) scale(.85)" />
      <Use href="#pf-hs" transform="translate(338,142)" />
      <Use href="#pf-hs" transform="translate(206,148) scale(.8)" />
      <Use href="#pf-hs" transform="translate(366,134) scale(.8)" />
      <G transform="translate(160,132)">
        <Rect x="-16" y="-16" width="32" height="20" fill="#F4ECDD" />
        <Rect x="-6" y="-38" width="12" height="24" fill="#E9E2D0" />
        <Path d="M-8 -38 L0 -52 L8 -38Z" fill="#6C7F8C" />
        <Rect x="-2" y="-30" width="4" height="7" fill="#5A6A70" />
        <Path d="M-18 -16 L0 -26 L18 -16Z" fill="#C84A1F" />
      </G>
      <Path d="M12 190 Q16 164 34 158 Q30 176 40 190Z" fill="#2E5E4C" />
      <Path d="M0 190 Q4 170 20 166 Q18 180 24 190Z" fill="#3F8A55" />
      <Path d="M0 182 Q70 170 140 180 T280 178 T390 170 V190 H0Z" fill={theme.colors.canvas} />
    </Svg>
  );
}
