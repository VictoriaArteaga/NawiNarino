import Svg, {
  ClipPath,
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Pattern,
  Polygon,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import type { SvgProps } from "react-native-svg";

import {
  caucaPath,
  outlinePath,
  putumayoPath,
  seaPath,
  zones,
} from "./narinoMapData";

/**
 * Map of the department of Nariño (390×520). The outline is the simplified
 * public department boundary; the colored inner zones are illustrative only.
 */
export function NarinoMap(props: SvgProps) {
  return (
    <Svg
      viewBox="0 0 390 520"
      preserveAspectRatio="xMidYMin slice"
      width="100%"
      height="100%"
      accessibilityLabel="Mapa esquemático del departamento de Nariño con zonas de color ilustrativas para Awá Pit, Inga, Nasa Yuwe y Cofán"
      {...props}
    >
      <Defs>
        <Pattern id="nm-topo" width="44" height="44" patternUnits="userSpaceOnUse">
          <Path
            d="M0 30 Q11 19 22 28 T44 24 M0 9 Q13 2 24 9 T44 5"
            stroke="#E2D7BB"
            strokeWidth="1"
            fill="none"
          />
        </Pattern>
        <Pattern id="nm-wave" width="30" height="14" patternUnits="userSpaceOnUse">
          <Path d="M0 7 Q7.5 0 15 7 T30 7" stroke="#B6D2DD" strokeWidth="1" fill="none" />
        </Pattern>
        <ClipPath id="nm-nar">
          <Path d={outlinePath} />
        </ClipPath>
        <LinearGradient id="nm-fade" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#EFE6CF" stopOpacity="1" />
          <Stop offset="1" stopColor="#EFE6CF" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      <Rect width="390" height="520" fill="#EFE6CF" />
      <Rect width="390" height="520" fill="url(#nm-topo)" />
      <Path
        d={caucaPath}
        fill="#E8DEC4"
        stroke="#B9AD8D"
        strokeWidth="1.2"
        strokeDasharray="5 3"
        strokeLinejoin="round"
      />
      <Path
        d={putumayoPath}
        fill="#E4D9BC"
        stroke="#B9AD8D"
        strokeWidth="1.2"
        strokeDasharray="5 3"
        strokeLinejoin="round"
      />
      <Path d={seaPath} fill="#CFE3EA" />
      <Path d={seaPath} fill="url(#nm-wave)" />

      {/* Soft drop shadow (offset copy of the outline) */}
      <Path d={outlinePath} fill="#5A4520" opacity={0.22} transform="translate(0 6)" />
      <Path d={outlinePath} fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="3" strokeLinejoin="round" />

      <G clipPath="url(#nm-nar)">
        {zones.map((zone) => (
          <Polygon
            key={zone.points}
            points={zone.points}
            fill={zone.color}
            stroke="#FBF7EE"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        ))}
        {zones.map((zone) => (
          <Circle key={`${zone.cx}-${zone.cy}`} cx={zone.cx} cy={zone.cy} r="1.8" fill="#FFFFFF" opacity={0.8} />
        ))}
      </G>
      <Path d={outlinePath} fill="none" stroke="#2F2E28" strokeWidth="2" strokeLinejoin="round" opacity={0.7} />

      <SvgText
        x="196"
        y="264"
        fontFamily="Outfit_800ExtraBold"
        fontSize="26"
        fill="#23302A"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinejoin="round"
        textAnchor="middle"
      >
        Nariño
      </SvgText>
      <SvgText
        x="196"
        y="264"
        fontFamily="Outfit_800ExtraBold"
        fontSize="26"
        fill="#23302A"
        textAnchor="middle"
      >
        Nariño
      </SvgText>

      <G fontFamily="Outfit_600SemiBold" fontSize="12" fill="#6F6A58">
        <SvgText x="205" y="58">Cauca</SvgText>
        <SvgText x="120" y="432">Ecuador</SvgText>
        <SvgText x="342" y="434">Putumayo</SvgText>
      </G>
      <G fontFamily="NunitoSans_400Regular_Italic" fontSize="11" fill="#4F8499">
        <SvgText x="6" y="120">Océano</SvgText>
        <SvgText x="6" y="133">Pacífico</SvgText>
      </G>
      <Rect width="390" height="86" fill="url(#nm-fade)" />
    </Svg>
  );
}
