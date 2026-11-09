import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Rect, Stop, Use } from "react-native-svg";
import type { SvgProps } from "react-native-svg";

/* Generated from the approved Ñawi-Nariño design artboards. */
export function ExplorerHero(props: SvgProps) {
  return (
    <Svg viewBox="0 0 390 215" preserveAspectRatio="xMidYMin slice" width="100%" height="100%" {...props}>
      <Defs>
        <LinearGradient id="eh-sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#2B1B52" />
          <Stop offset=".45" stopColor="#5B3F8F" />
          <Stop offset=".78" stopColor="#A877B4" />
          <Stop offset="1" stopColor="#F0B58D" />
        </LinearGradient>
        <RadialGradient id="eh-glow" cx=".5" cy=".5" r=".5">
          <Stop offset="0" stopColor="#F3E3FF" stopOpacity=".85" />
          <Stop offset=".5" stopColor="#C9A8E8" stopOpacity=".3" />
          <Stop offset="1" stopColor="#C9A8E8" stopOpacity="0" />
        </RadialGradient>
        <G id="eh-ojo">
          <G fill="#E8A33D">
            <Path d="M0 -24 L3.400 -15.800 L-3.400 -15.800Z" transform="rotate(0)" />
            <Path d="M0 -24 L3.400 -15.800 L-3.400 -15.800Z" transform="rotate(45)" />
            <Path d="M0 -24 L3.400 -15.800 L-3.400 -15.800Z" transform="rotate(90)" />
            <Path d="M0 -24 L3.400 -15.800 L-3.400 -15.800Z" transform="rotate(135)" />
            <Path d="M0 -24 L3.400 -15.800 L-3.400 -15.800Z" transform="rotate(180)" />
            <Path d="M0 -24 L3.400 -15.800 L-3.400 -15.800Z" transform="rotate(225)" />
            <Path d="M0 -24 L3.400 -15.800 L-3.400 -15.800Z" transform="rotate(270)" />
            <Path d="M0 -24 L3.400 -15.800 L-3.400 -15.800Z" transform="rotate(315)" />
          </G>
          <G fill="#F3C46B">
            <Path d="M0 -21 L2.200 -15.800 L-2.200 -15.800Z" transform="rotate(22.5)" />
            <Path d="M0 -21 L2.200 -15.800 L-2.200 -15.800Z" transform="rotate(67.5)" />
            <Path d="M0 -21 L2.200 -15.800 L-2.200 -15.800Z" transform="rotate(112.5)" />
            <Path d="M0 -21 L2.200 -15.800 L-2.200 -15.800Z" transform="rotate(157.5)" />
            <Path d="M0 -21 L2.200 -15.800 L-2.200 -15.800Z" transform="rotate(202.5)" />
            <Path d="M0 -21 L2.200 -15.800 L-2.200 -15.800Z" transform="rotate(247.5)" />
            <Path d="M0 -21 L2.200 -15.800 L-2.200 -15.800Z" transform="rotate(292.5)" />
            <Path d="M0 -21 L2.200 -15.800 L-2.200 -15.800Z" transform="rotate(337.5)" />
          </G>
          <Circle r="15.500" fill="#6B4A9E" />
          <Circle r="13.600" fill="none" stroke="#F3D79A" strokeWidth="1" strokeDasharray="1.600 2.200" strokeLinecap="round" />
          <Path d="M-10 0 Q0 -8.600 10 0 Q0 8.600 -10 0Z" fill="#FBF3E6" />
          <Circle r="4.800" fill="#3E2A66" />
          <Circle r="2" fill="#E8A33D" />
          <Circle cx="-1.400" cy="-1.600" r="1" fill="#fff" />
        </G>
        <Path id="eh-spk" d="M0 -5 L1.200 -1.200 L5 0 L1.200 1.200 L0 5 L-1.200 1.200 L-5 0 L-1.200 -1.200Z" />
      </Defs>
      <Rect width="390" height="215" fill="url(#eh-sky)" />
      <G fill="#fff" opacity=".85">
        <Circle cx="30" cy="40" r="1.300" />
        <Circle cx="96" cy="26" r="1.100" />
        <Circle cx="150" cy="62" r="1.400" />
        <Circle cx="196" cy="30" r="1.100" />
        <Circle cx="214" cy="84" r="1.200" />
        <Circle cx="350" cy="28" r="1.400" />
        <Circle cx="372" cy="70" r="1" />
        <Circle cx="60" cy="96" r="1.100" />
        <Circle cx="250" cy="22" r="1" />
      </G>
      <G fill="#E8A33D">
        <Use href="#eh-spk" transform="translate(120,40)" />
        <Use href="#eh-spk" transform="translate(330,60) scale(.8)" />
        <Use href="#eh-spk" transform="translate(42,70) scale(.7)" />
      </G>
      <G stroke="#fff" strokeWidth="1" opacity=".5" fill="none">
        <Path d="M172 100 V148 M150 124 H194" />
      </G>
      <G fill="#fff">
        <Circle cx="172" cy="100" r="2.200" />
        <Circle cx="172" cy="148" r="2.200" />
        <Circle cx="150" cy="124" r="1.800" />
        <Circle cx="194" cy="124" r="1.800" />
        <Circle cx="172" cy="124" r="1.400" />
      </G>
      <Circle cx="308" cy="124" r="92" fill="url(#eh-glow)" />
      <Use href="#eh-ojo" transform="translate(308,124) scale(1.7)" />
      <Path d="M0 156 L50 126 L96 148 L150 120 L210 150 L270 128 L330 152 L390 130 V215 H0Z" fill="#6A4C9A" />
      <Path d="M0 176 Q60 148 130 168 T260 160 T390 156 V215 H0Z" fill="#4A3478" />
      <Path d="M0 196 Q80 176 170 194 T390 184 V215 H0Z" fill="#2E2056" />
      <Path d="M0 204 Q70 194 140 202 T280 200 T390 194 V215 H0Z" fill="#F5EDE0" />
    </Svg>
  );
}
