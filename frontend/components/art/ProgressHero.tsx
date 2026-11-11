import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import type { SvgProps } from "react-native-svg";

import { theme } from "../../constants/theme";
/* Generated from the approved Ñawi-Nariño design artboards. */
export function ProgressHero(props: SvgProps) {
  return (
    <Svg viewBox="0 0 390 200" preserveAspectRatio="xMidYMin slice" width="100%" height="100%" {...props}>
      <Defs>
        <LinearGradient id="ph-sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#CFE3D2" />
          <Stop offset=".6" stopColor="#F3EBCB" />
          <Stop offset="1" stopColor="#F9E4BE" />
        </LinearGradient>
        <RadialGradient id="ph-sun" cx=".5" cy=".5" r=".5">
          <Stop offset="0" stopColor="#FFE7A8" stopOpacity=".95" />
          <Stop offset="1" stopColor="#FFE7A8" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width="390" height="200" fill="url(#ph-sky)" />
      <Circle cx="324" cy="62" r="80" fill="url(#ph-sun)" />
      <Circle cx="324" cy="62" r="18" fill="#FFF0C4" />
      <G fill="#fff" opacity=".6">
        <Ellipse cx="270" cy="34" rx="40" ry="6" />
        <Ellipse cx="60" cy="70" rx="44" ry="6" />
      </G>
      <Path d="M0 124 Q50 96 110 116 T230 108 T390 96 V200 H0Z" fill="#A2C8AE" />
      <Path d="M150 200 L248 76 L270 98 L296 64 L372 200Z" fill="#7FA6A0" />
      <Path d="M296 64 L314 88 L304 84 L296 98 L286 84Z" fill="#fff" opacity=".9" />
      <Path d="M20 200 L132 66 L166 102 L196 84 L330 200Z" fill="#5E918B" />
      <Path d="M132 66 L152 90 L142 88 L134 100 L124 86Z" fill="#fff" />
      <Path d="M0 158 Q80 136 170 156 T390 146 V200 H0Z" fill="#4C8B6C" />
      <Path d="M84 196 Q150 182 122 164 Q82 150 136 132 Q178 120 150 106 Q138 100 134 84" stroke="#FBF3E6" strokeWidth="3.500" strokeDasharray="1 7" strokeLinecap="round" fill="none" />
      <Circle cx="122" cy="164" r="6.500" fill="#2F6F4E" stroke="#fff" strokeWidth="2.500" />
      <Circle cx="150" cy="106" r="6.500" fill="#C84A1F" stroke="#fff" strokeWidth="2.500" />
      <Path d="M134 84 V58" stroke="#6B4A2E" strokeWidth="2.500" strokeLinecap="round" />
      <Path d="M134 58 L158 66 L134 74Z" fill="#C84A1F" />
      <Path d="M0 186 Q70 174 140 184 T280 182 T390 174 V200 H0Z" fill={theme.colors.canvas} />
    </Svg>
  );
}
