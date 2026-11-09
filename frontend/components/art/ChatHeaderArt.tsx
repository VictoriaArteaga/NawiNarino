import Svg, { Circle, Defs, G, LinearGradient, Path, Stop, Use } from "react-native-svg";
import type { SvgProps } from "react-native-svg";

/* Generated from the approved Ñawi-Nariño design artboards. */
export function ChatHeaderArt(props: SvgProps) {
  return (
    <Svg viewBox="0 0 390 104" preserveAspectRatio="xMidYMin slice" width="100%" height="100%" {...props}>
      <Defs>
        <LinearGradient id="ch-hd" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#3E2A66" />
          <Stop offset="1" stopColor="#6B4A9E" />
        </LinearGradient>
        <Path id="ch-spk" d="M0 -5 L1.200 -1.200 L5 0 L1.200 1.200 L0 5 L-1.200 1.200 L-5 0 L-1.200 -1.200Z" />
      </Defs>
      <Path d="M0 0 H390 V84 Q195 112 0 84Z" fill="url(#ch-hd)" />
      <G fill="#fff" opacity=".7">
        <Circle cx="250" cy="22" r="1.200" />
        <Circle cx="300" cy="50" r="1" />
        <Circle cx="350" cy="18" r="1.300" />
        <Circle cx="210" cy="60" r="1" />
        <Circle cx="372" cy="62" r="1" />
      </G>
      <G fill="#E8A33D">
        <Use href="#ch-spk" transform="translate(280,24)" />
        <Use href="#ch-spk" transform="translate(338,44) scale(.7)" />
      </G>
      <Path d="M0 84 Q195 112 390 84" stroke="#E8A33D" strokeWidth="2" fill="none" opacity=".6" />
    </Svg>
  );
}
