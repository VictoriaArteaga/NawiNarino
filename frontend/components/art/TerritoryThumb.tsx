import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import type { SvgProps } from "react-native-svg";

/* Generated from the approved Ñawi-Nariño design artboards. */
export function TerritoryThumb(props: SvgProps) {
  return (
    <Svg viewBox="0 0 340 84" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" {...props}>
      <Defs>
        <LinearGradient id="tt-c" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#A9CBE0" />
          <Stop offset="1" stopColor="#F3E8CF" />
        </LinearGradient>
      </Defs>
      <Rect width="340" height="84" fill="url(#tt-c)" />
      <Path d="M0 60 L70 30 L120 52 L200 14 L270 48 L340 28 V84 H0Z" fill="#7C9AA8" />
      <Path d="M200 14 L214 30 L204 27 L198 36 L190 28Z" fill="#fff" />
      <Path d="M0 70 Q90 50 180 66 T340 60 V84 H0Z" fill="#6E9A63" />
      <Path d="M0 78 Q100 70 200 78 T340 74 V84 H0Z" fill="#4F7F4A" />
    </Svg>
  );
}
