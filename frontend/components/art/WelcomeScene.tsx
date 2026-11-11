import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop, Use } from "react-native-svg";
import type { SvgProps } from "react-native-svg";

/* Generated from the approved Ñawi-Nariño design artboards. */
export function WelcomeScene(props: SvgProps) {
  return (
    <Svg viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice" width="100%" height="100%" {...props}>
      <Defs>
        <LinearGradient id="ws-sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#F3BD84" />
          <Stop offset=".3" stopColor="#F8D9AE" />
          <Stop offset=".55" stopColor="#FBEBD0" />
          <Stop offset=".72" stopColor="#E6EEE6" />
        </LinearGradient>
        <RadialGradient id="ws-halo" cx=".5" cy=".5" r=".5">
          <Stop offset="0" stopColor="#FFD28A" stopOpacity=".95" />
          <Stop offset=".5" stopColor="#FFD28A" stopOpacity=".35" />
          <Stop offset="1" stopColor="#FFD28A" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="ws-par" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#D2BC63" />
          <Stop offset="1" stopColor="#9FA650" />
        </LinearGradient>
        <LinearGradient id="ws-lake" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#8CC2C8" />
          <Stop offset="1" stopColor="#5E9FAE" />
        </LinearGradient>
        <G id="ws-fr">
          <Rect x="-3.500" y="0" width="7" height="34" rx="3" fill="#9B8657" />
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
        <Path id="ws-bird" d="M0 0 Q10 -7 24 -1 Q12 -3 2 4 Q-10 -3 -24 -1 Q-10 -7 0 0Z" />
        <Path id="ws-spk" d="M0 -5 L1.200 -1.200 L5 0 L1.200 1.200 L0 5 L-1.200 1.200 L-5 0 L-1.200 -1.200Z" />
      </Defs>
      <Rect width="390" height="844" fill="url(#ws-sky)" />
      <G>
        <Circle cx="120" cy="528" r="230" fill="url(#ws-halo)" />
      </G>
      <G fill="#FFE3AE" opacity=".35">
        <Path d="M120 528 L-40 330 L10 300Z" />
        <Path d="M120 528 L60 280 L120 270Z" />
        <Path d="M120 528 L200 270 L260 290Z" />
        <Path d="M120 528 L330 330 L380 380Z" />
      </G>
      <Circle cx="120" cy="520" r="30" fill="#F59B45" />
      <G fill="#E8A33D" opacity=".8">
        <Use href="#ws-spk" transform="translate(34,492) scale(.8)" />
        <Use href="#ws-spk" transform="translate(352,452) scale(.7)" />
        <Use href="#ws-spk" transform="translate(214,500) scale(.6)" />
        <Use href="#ws-spk" transform="translate(372,424) scale(.6)" />
      </G>
      <G fill="#fff" opacity=".62">
        <Ellipse cx="70" cy="60" rx="56" ry="9" />
        <Ellipse cx="320" cy="48" rx="50" ry="8" />
        <Ellipse cx="350" cy="64" rx="34" ry="6" />
        <Ellipse cx="60" cy="470" rx="52" ry="6" />
        <Ellipse cx="250" cy="488" rx="44" ry="5" />
      </G>
      <Path d="M0 480 L40 456 L84 474 L130 440 L178 470 L228 452 L276 480 L330 450 L390 476 V844 H0Z" fill="#AFC8C6" />
      <Path d="M196 568 L258 468 L280 436 L300 426 L324 434 L344 466 L420 568Z" fill="#6C9A97" />
      <Path d="M300 426 L324 434 L344 466 L420 568 L330 568Z" fill="#86B0AB" />
      <G fill="#fff" opacity=".8">
        <Circle cx="318" cy="418" r="10" />
        <Circle cx="330" cy="402" r="12" />
        <Circle cx="346" cy="384" r="13" />
        <Circle cx="364" cy="366" r="10" />
      </G>
      <Path d="M0 548 Q70 514 150 536 Q220 554 290 534 Q350 518 390 536 V844 H0Z" fill="#4A8077" />
      <Path d="M0 606 Q90 570 190 598 Q290 622 390 590 V844 H0Z" fill="url(#ws-par)" />
      <G stroke="#E9DA8C" strokeWidth="1.600" strokeLinecap="round" opacity=".7">
        <Path d="M40 610 l2 -6 M54 608 l2 -6 M210 614 l2 -6 M226 616 l2 -6 M300 604 l2 -6 M316 602 l2 -6 M120 618 l2 -6" />
      </G>
      <Path d="M30 654 Q100 622 200 632 Q300 640 372 624 L386 706 Q200 738 18 712Z" fill="url(#ws-lake)" />
      <Path d="M240 640 L262 640 L252 700 Z" fill="#6C9A97" opacity=".28" />
      <G stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".5">
        <Path d="M70 670 H150 M180 682 H270 M286 662 H350 M96 696 H180 M230 702 H310" />
      </G>
      <Path d="M0 704 Q60 654 130 704 Q170 734 182 844 H0Z" fill="#2E5E4C" />
      <Path d="M390 684 Q330 654 270 714 Q240 744 236 844 H390Z" fill="#335F4E" />
      <Use href="#ws-fr" transform="translate(40,668) scale(1.5)" />
      <Use href="#ws-fr" transform="translate(98,704) scale(1.1)" />
      <Use href="#ws-fr" transform="translate(352,650) scale(1.5)" />
      <Use href="#ws-fr" transform="translate(300,690) scale(1.1)" />
      <G>
        <Path d="M0 844 C0 770 20 730 62 706 C70 760 50 810 0 844Z" fill="#1F4D3A" />
        <Path d="M0 844 C10 790 40 760 96 752 C84 800 50 830 0 844Z" fill="#3F8A55" />
        <Path d="M0 844 C20 800 60 784 120 790 C90 820 50 836 0 844Z" fill="#D9702F" />
        <Path d="M20 844 C40 808 80 796 118 800 C96 824 64 840 20 844Z" fill="#E8A33D" />
        <Path d="M390 844 C390 770 372 726 330 706 C322 760 342 810 390 844Z" fill="#1F4D3A" />
        <Path d="M390 844 C380 790 350 760 296 752 C308 800 342 830 390 844Z" fill="#3F8A55" />
        <Path d="M390 844 C370 800 330 784 272 790 C300 820 340 836 390 844Z" fill="#D9702F" />
        <Path d="M370 844 C350 808 310 796 272 800 C296 824 328 840 370 844Z" fill="#E8A33D" />
      </G>
      <Use href="#ws-bird" fill="#2B2A26" transform="translate(62,512) scale(.9)" />
      <Use href="#ws-bird" fill="#2B2A26" transform="translate(100,496) scale(.6)" />
    </Svg>
  );
}
