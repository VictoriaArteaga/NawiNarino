import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop, Use } from "react-native-svg";
import type { SvgProps } from "react-native-svg";

import { theme } from "../../constants/theme";
/* Generated from the approved Ñawi-Nariño design artboards. */
export function CofanHero(props: SvgProps) {
  return (
    <Svg viewBox="0 0 390 240" preserveAspectRatio="xMidYMin slice" width="100%" height="100%" {...props}>
      <Defs>
        <LinearGradient id="cf-sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#4A3478" />
          <Stop offset=".4" stopColor="#8B5EA3" />
          <Stop offset=".75" stopColor="#F0A585" />
          <Stop offset="1" stopColor="#F8D3A0" />
        </LinearGradient>
        <LinearGradient id="cf-river" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#F0A585" />
          <Stop offset="1" stopColor="#B7779E" />
        </LinearGradient>
        <RadialGradient id="cf-moon" cx=".5" cy=".5" r=".5">
          <Stop offset="0" stopColor="#FFF3D6" stopOpacity=".6" />
          <Stop offset="1" stopColor="#FFF3D6" stopOpacity="0" />
        </RadialGradient>
        <G id="cf-palm">
          <Path d="M0 0 Q3 -22 0 -44" stroke="#1D3A2E" strokeWidth="3.200" fill="none" strokeLinecap="round" />
          <G stroke="#1F4034" strokeWidth="3" fill="none" strokeLinecap="round">
            <Path d="M0 -44 Q16 -58 34 -46" />
            <Path d="M0 -44 Q-16 -58 -34 -46" />
            <Path d="M0 -44 Q12 -64 26 -62" />
            <Path d="M0 -44 Q-12 -64 -26 -62" />
            <Path d="M0 -44 Q2 -66 0 -72" />
            <Path d="M0 -44 Q22 -48 38 -34" />
            <Path d="M0 -44 Q-22 -48 -38 -34" />
          </G>
        </G>
        <G id="cf-macaw">
          <Path d="M-6 2 Q-34 22 -46 16 Q-30 10 -8 -2Z" fill="#E8A33D" />
          <Path d="M-6 2 Q-30 18 -42 28 Q-26 14 -4 4Z" fill="#2E6FA8" />
          <Ellipse cx="0" cy="0" rx="14" ry="7" fill="#D32F2F" transform="rotate(-14)" />
          <Path d="M-4 -4 Q8 -30 28 -30 Q16 -12 4 0Z" fill="#B3261E" />
          <Path d="M8 -12 Q24 -34 38 -28 Q26 -18 12 -6Z" fill="#E8A33D" />
          <Circle cx="13" cy="-5" r="5.500" fill="#D32F2F" />
          <Path d="M16 -8 Q24 -6 21 2 Q18 -2 16 -3Z" fill="#F4ECDD" />
          <Path d="M18 -4 Q26 -4 24 4 Q20 0 18 0Z" fill="#2B2A26" />
        </G>
      </Defs>
      <Rect width="390" height="240" fill="url(#cf-sky)" />
      <G fill="#fff" opacity=".85">
        <Circle cx="30" cy="28" r="1.300" />
        <Circle cx="110" cy="18" r="1.100" />
        <Circle cx="170" cy="40" r="1.400" />
        <Circle cx="230" cy="22" r="1.100" />
        <Circle cx="330" cy="34" r="1.400" />
        <Circle cx="362" cy="18" r="1" />
        <Circle cx="270" cy="52" r="1" />
        <Circle cx="60" cy="64" r="1.100" />
      </G>
      <Circle cx="306" cy="62" r="50" fill="url(#cf-moon)" />
      <Circle cx="306" cy="62" r="17" fill="#FFF3D6" />
      <Circle cx="312" cy="58" r="17" fill="#8B5EA3" opacity=".0" />
      <G fill="#fff" opacity=".35">
        <Ellipse cx="90" cy="96" rx="60" ry="6" />
        <Ellipse cx="260" cy="110" rx="66" ry="5" />
      </G>
      <Path d="M0 134 L60 110 L130 132 L200 104 L270 130 L340 108 L390 126 V240 H0Z" fill="#6A5088" />
      <Path d="M0 154 Q40 140 80 150 Q120 136 170 150 Q220 134 270 150 Q320 138 390 150 V240 H0Z" fill="#3F5D6A" />
      <Ellipse cx="200" cy="160" rx="200" ry="8" fill="#F0C9B0" opacity=".45" />
      <Path d="M0 172 Q30 156 60 170 Q90 154 130 170 Q170 154 210 170 Q250 154 290 170 Q330 156 390 168 V240 H0Z" fill="#2C4A44" />
      <Path d="M120 240 Q180 200 200 188 Q226 176 250 176 Q330 176 390 170 V196 Q300 196 262 206 Q224 216 214 240Z" fill="url(#cf-river)" />
      <G stroke="#fff" strokeWidth="1.800" strokeLinecap="round" opacity=".45">
        <Path d="M230 192 H300 M250 202 H320 M240 214 H270" />
      </G>
      <Path d="M0 196 Q40 180 80 194 Q110 186 140 206 L160 240 H0Z" fill="#1F4034" />
      <Path d="M390 204 Q350 190 318 206 Q296 218 290 240 H390Z" fill="#1F4034" />
      <G fill="#183629">
        <Circle cx="20" cy="188" r="14" />
        <Circle cx="44" cy="182" r="16" />
        <Circle cx="70" cy="190" r="13" />
        <Circle cx="366" cy="200" r="14" />
        <Circle cx="340" cy="196" r="12" />
      </G>
      <Use href="#cf-palm" transform="translate(40,206) scale(.9)" />
      <Use href="#cf-palm" transform="translate(96,214) scale(.62)" />
      <Use href="#cf-palm" transform="translate(354,214) scale(.85)" />
      <Use href="#cf-macaw" transform="translate(150,72) scale(.9)" />
      <Use href="#cf-macaw" transform="translate(214,52) scale(.62)" />
      <Path d="M0 226 Q70 214 140 224 T280 222 T390 214 V240 H0Z" fill={theme.colors.canvas} />
    </Svg>
  );
}
