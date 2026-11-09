import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop, Use } from "react-native-svg";
import type { SvgProps } from "react-native-svg";

/* Generated from the approved Ñawi-Nariño design artboards. */
export function IngaHero(props: SvgProps) {
  return (
    <Svg viewBox="0 0 390 240" preserveAspectRatio="xMidYMin slice" width="100%" height="100%" {...props}>
      <Defs>
        <LinearGradient id="ig-sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#F2A65A" />
          <Stop offset=".5" stopColor="#F8CB84" />
          <Stop offset="1" stopColor="#FCE9BE" />
        </LinearGradient>
        <RadialGradient id="ig-sun" cx=".5" cy=".5" r=".5">
          <Stop offset="0" stopColor="#FFF3CF" stopOpacity=".95" />
          <Stop offset="1" stopColor="#FFF3CF" stopOpacity="0" />
        </RadialGradient>
        <G id="ig-maize">
          <Path d="M0 0 V-58" stroke="#5E8A3C" strokeWidth="3.500" strokeLinecap="round" />
          <G fill="#6FA044">
            <Path d="M0 -14 Q-24 -22 -34 -8 Q-16 -10 0 -6Z" />
            <Path d="M0 -26 Q26 -36 38 -20 Q18 -22 0 -18Z" />
            <Path d="M0 -40 Q-22 -52 -32 -38 Q-14 -38 0 -32Z" />
            <Path d="M0 -52 Q20 -66 30 -54 Q14 -50 0 -46Z" />
          </G>
          <Ellipse cx="6" cy="-34" rx="4.500" ry="11" fill="#E9B546" transform="rotate(14 6 -34)" />
          <Path d="M0 -58 l-3 -10 M0 -58 l4 -9 M0 -58 l0 -11" stroke="#C8863A" strokeWidth="1.800" strokeLinecap="round" />
        </G>
      </Defs>
      <Rect width="390" height="240" fill="url(#ig-sky)" />
      <Circle cx="292" cy="112" r="92" fill="url(#ig-sun)" />
      <Circle cx="292" cy="118" r="24" fill="#FFF0C4" />
      <G stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".45">
        <Path d="M30 52 H120 M60 66 H150 M250 40 H340 M280 54 H360" />
      </G>
      <Path d="M0 132 L56 98 L112 124 L178 86 L240 120 L306 96 L390 128 V240 H0Z" fill="#C98B83" />
      <Path d="M178 86 L196 104 L184 100 L176 112 L166 100Z" fill="#fff" opacity=".35" />
      <Path d="M0 150 Q70 118 150 142 T290 136 T390 140 V240 H0Z" fill="#A47383" />
      <Ellipse cx="200" cy="152" rx="170" ry="7" fill="#FCE9BE" opacity=".5" />
      <Path d="M0 164 Q80 144 170 160 T390 152 V240 H0Z" fill="#8F9A4E" />
      <Path d="M0 174 L126 162 L96 196 L0 206Z" fill="#8DAE52" />
      <Path d="M126 162 L252 160 L262 190 L96 196Z" fill="#E3B94E" />
      <Path d="M252 160 L390 166 L390 198 L262 190Z" fill="#C86F3A" />
      <Path d="M0 206 L96 196 L64 240 H0Z" fill="#6E9A45" />
      <Path d="M96 196 L262 190 L304 240 H64Z" fill="#D9A441" />
      <Path d="M262 190 L390 198 V240 H304Z" fill="#8DAE52" />
      <G stroke="#fff" strokeWidth="1.600" opacity=".35" fill="none">
        <Path d="M0 174 L126 162 L252 160 L390 166" />
        <Path d="M0 206 L96 196 L262 190 L390 198" />
        <Path d="M126 162 L96 196 L64 240" />
        <Path d="M252 160 L262 190 L304 240" />
      </G>
      <G stroke="#000" strokeWidth="1.200" opacity=".14">
        <Path d="M20 210 L40 214 M30 220 L60 226 M130 200 L120 210 M160 198 L158 214 M200 196 L204 214 M240 194 L250 214 M310 204 L330 212 M340 214 L360 224" />
      </G>
      <Use href="#ig-maize" transform="translate(30,238) scale(1.15)" />
      <Use href="#ig-maize" transform="translate(66,240) scale(.9)" />
      <Use href="#ig-maize" transform="translate(356,238) scale(1.2)" />
      <Use href="#ig-maize" transform="translate(322,240) scale(.9)" />
      <G transform="translate(250,140)">
        <Path d="M-22 6 Q-34 -6 -22 -14 Q-16 -4 -8 2Z" fill="#fff" opacity=".7" />
        <Ellipse cx="0" cy="0" rx="10" ry="6" fill="#2F8F83" transform="rotate(-20)" />
        <Circle cx="9" cy="-6" r="5" fill="#1F6F6A" />
        <Path d="M13 -7 L34 -14" stroke="#2B2A26" strokeWidth="2" strokeLinecap="round" />
        <Path d="M-9 4 L-20 12" stroke="#C84A1F" strokeWidth="3" strokeLinecap="round" />
        <Circle cx="10" cy="-7" r="1.200" fill="#fff" />
      </G>
      <Path d="M0 226 Q70 214 140 224 T280 222 T390 214 V240 H0Z" fill="#F5EDE0" />
    </Svg>
  );
}
