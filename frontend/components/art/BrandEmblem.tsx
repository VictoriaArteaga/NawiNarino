import Svg, { Circle, G, Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";

const LONG_RAY = "M0 -40 L4 -30 L0 -26 L-4 -30Z";
const SHORT_RAY = "M0 -34 L2.500 -29 L0 -26 L-2.500 -29Z";
const LONG_ANGLES = [-80, -60, -40, -20, 0, 20, 40, 60, 80];
const SHORT_ANGLES = [-70, -50, -30, -10, 10, 30, 50, 70];
const GRECA =
  "M8 87 H20 V83 H32 V87 H44 V83 H56 V87 H68 V83 H80 V87 H92 V83 H104 V87 H116 V83 H128 V87 H140 V83 H152";

interface BrandEmblemProps extends SvgProps {
  /** Versión para fondos oscuros (verde profundo): volcán en crema y acentos más claros. */
  onDark?: boolean;
}

/**
 * Emblema Ñawi: el volcán Galeras de Pasto con un sol de rayos geométricos detrás
 * (inspirado en el sol de los Pastos) y una greca escalonada como base.
 */
export function BrandEmblem({ onDark = false, ...props }: BrandEmblemProps) {
  const volcano = onDark ? "#F5EDE0" : "#1F4D3A";
  const peaks = onDark ? "#3F8A63" : "#2F6F4E";
  const accent = onDark ? "#E0623A" : "#C84A1F";

  return (
    <Svg viewBox="0 0 160 92" width="100%" height="100%" {...props}>
      <G transform="translate(80,46)">
        <G fill="#E8A33D">
          {LONG_ANGLES.map((angle) => (
            <Path key={angle} d={LONG_RAY} transform={`rotate(${angle})`} />
          ))}
        </G>
        <G fill={accent}>
          {SHORT_ANGLES.map((angle) => (
            <Path key={angle} d={SHORT_RAY} transform={`rotate(${angle})`} />
          ))}
        </G>
        <Circle r="21" fill="#E8A33D" />
        <Circle r="13" fill="#F3C46B" />
      </G>

      <Path d="M8 80 L32 54 L56 80Z" fill={peaks} />
      <Path d="M104 80 L130 50 L152 80Z" fill={peaks} />
      <Path d="M36 80 L62 48 L68 44 L92 44 L98 48 L124 80Z" fill={volcano} />
      <Path d="M68 44 L92 44 L88 50 L80 47 L72 50Z" fill={accent} />
      <Path
        d="M80 47 L78 58 L82 66 L79 80"
        fill="none"
        stroke="#E8A33D"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d={GRECA} fill="none" stroke={accent} strokeWidth="2.6" />
    </Svg>
  );
}
