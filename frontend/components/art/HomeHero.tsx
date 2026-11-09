import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop, Use } from "react-native-svg";
import type { SvgProps } from "react-native-svg";

/* Generated from the approved Ñawi-Nariño design artboards. */
export function HomeHero(props: SvgProps) {
  return (
    <Svg viewBox="0 0 390 330" preserveAspectRatio="xMidYMin slice" width="100%" height="100%" {...props}>
      <Defs>
        <LinearGradient id="hh-sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#F8D9A6" />
          <Stop offset=".5" stopColor="#FBE9CC" />
          <Stop offset="1" stopColor="#E4EDE4" />
        </LinearGradient>
        <RadialGradient id="hh-halo" cx=".5" cy=".5" r=".5">
          <Stop offset="0" stopColor="#FFD28A" stopOpacity=".9" />
          <Stop offset="1" stopColor="#FFD28A" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="hh-par" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#D2BC63" />
          <Stop offset="1" stopColor="#9FA650" />
        </LinearGradient>
        <LinearGradient id="hh-lake" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#8CC2C8" />
          <Stop offset="1" stopColor="#5E9FAE" />
        </LinearGradient>
        <G id="hh-fr">
          <Rect x="-3.5" y="0" width="7" height="34" rx="3" fill="#9B8657" />
          <Path d="M-3 8 l-5 3 M3 14 l5 3 M-3 22 l-5 3" stroke="#B9A56F" strokeWidth="2" strokeLinecap="round" />
          <G fill="#8FA84C">
            <Path d="M0 0 L-3 -22 L0 -29 L3 -22Z" transform="rotate(-72)" />
            <Path d="M0 0 L-3 -22 L0 -29 L3 -22Z" transform="rotate(-48)" />
            <Path d="M0 0 L-3 -22 L0 -29 L3 -22Z" transform="rotate(-24)" />
            <Path d="M0 0 L-3 -24 L0 -31 L3 -24Z" />
            <Path d="M0 0 L-3 -22 L0 -29 L3 -22Z" transform="rotate(24)" />
            <Path d="M0 0 L-3 -22 L0 -29 L3 -22Z" transform="rotate(48)" />
            <Path d="M0 0 L-3 -22 L0 -29 L3 -22Z" transform="rotate(72)" />
          </G>
          <G fill="#DCDB92">
            <Path d="M0 -20 L-1.500 -26 L0 -30 L1.500 -26Z" transform="rotate(-48)" />
            <Path d="M0 -22 L-1.500 -28 L0 -32 L1.500 -28Z" />
            <Path d="M0 -20 L-1.500 -26 L0 -30 L1.500 -26Z" transform="rotate(48)" />
          </G>
        </G>
      </Defs>
      <Rect width="390" height="330" fill="url(#hh-sky)" />
      <Circle cx="118" cy="214" r="96" fill="url(#hh-halo)" />
      <Circle cx="118" cy="206" r="20" fill="#F59B45" />
      <G fill="#fff" opacity=".6">
        <Ellipse cx="318" cy="100" rx="44" ry="8" />
        <Ellipse cx="344" cy="114" rx="34" ry="6" />
        <Ellipse cx="78" cy="184" rx="46" ry="5" />
        <Ellipse cx="236" cy="190" rx="38" ry="4" />
      </G>
      <Path d="M0 196 L38 178 L70 192 L112 166 L150 190 L200 172 L246 196 L290 176 L330 194 L390 170 V330 H0Z" fill="#A8C3C2" />
      <Path d="M244 232 L292 168 L306 158 L326 158 L340 166 L382 232Z" fill="#6C9A97" />
      <Path d="M306 158 L326 158 L340 166 L382 232 L322 232Z" fill="#86B0AB" />
      <G fill="#fff" opacity=".78">
        <Circle cx="318" cy="150" r="9" />
        <Circle cx="328" cy="137" r="11" />
        <Circle cx="342" cy="124" r="12" />
        <Circle cx="358" cy="113" r="9" />
      </G>
      <Path d="M0 214 Q60 190 130 208 Q190 222 250 206 Q320 190 390 210 V330 H0Z" fill="#4A8077" />
      <Path d="M0 236 Q80 212 170 232 Q260 250 330 226 Q360 218 390 224 V330 H0Z" fill="url(#hh-par)" />
      <G stroke="#E9DA8C" strokeWidth="1.600" strokeLinecap="round" opacity=".7">
        <Path d="M40 238 l2 -6 M52 236 l2 -6 M210 240 l2 -6 M224 242 l2 -6 M300 232 l2 -6 M314 230 l2 -6" />
      </G>
      <Path d="M24 262 Q70 238 150 246 Q230 254 300 244 Q350 238 380 250 L384 290 Q200 306 24 290Z" fill="url(#hh-lake)" />
      <G stroke="#fff" strokeWidth="1.800" strokeLinecap="round" opacity=".5">
        <Path d="M70 262 H130 M160 270 H240 M262 258 H330 M100 278 H170 M220 282 H290" />
      </G>
      <Path d="M0 262 Q50 240 100 270 Q124 288 130 330 H0Z" fill="#2E5E4C" />
      <Path d="M390 250 Q340 244 300 276 Q280 296 276 330 H390Z" fill="#335F4E" />
      <Use href="#hh-fr" transform="translate(24,226)" />
      <Use href="#hh-fr" transform="translate(56,240) scale(.8)" />
      <Use href="#hh-fr" transform="translate(364,214)" />
      <Use href="#hh-fr" transform="translate(334,236) scale(.78)" />
      <G fill="#2B2A26" transform="translate(232,186) scale(.7)">
        <Path d="M0 0 Q10 -7 24 -1 Q12 -3 2 4 Q-10 -3 -24 -1 Q-10 -7 0 0Z" />
      </G>
      <Path d="M0 312 Q70 300 140 310 T280 308 T390 300 V330 H0Z" fill="#F5EDE0" />
    </Svg>
  );
}
