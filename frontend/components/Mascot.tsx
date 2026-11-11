import Svg, { Circle, G, Path } from "react-native-svg";

import { tone } from "../constants/theme";
interface MascotProps {
  size?: number;
  /** Adds a soft white halo (for dark backgrounds). */
  halo?: boolean;
}

const longRays = [0, 45, 90, 135, 180, 225, 270, 315];
const shortRays = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];

/** Ñawi's symbol: the "ojo-sol" (an eye inside the Sol de los Pastos). */
export function Mascot({ size = 44, halo = false }: MascotProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="-24 -24 48 48"
      accessibilityLabel="Símbolo de Ñawi: un ojo dentro de un sol"
    >
      {halo ? <Circle r="23.5" fill="#FFFFFF" opacity={0.25} /> : null}
      <G fill="#E8A33D">
        {longRays.map((a) => (
          <Path
            key={a}
            d="M0 -24 L3.4 -15.8 L-3.4 -15.8Z"
            transform={`rotate(${a})`}
          />
        ))}
      </G>
      <G fill="#F3C46B">
        {shortRays.map((a) => (
          <Path
            key={a}
            d="M0 -21 L2.2 -15.8 L-2.2 -15.8Z"
            transform={`rotate(${a})`}
          />
        ))}
      </G>
      <Circle r="15.5" fill={tone("#6B4A9E")} />
      <Circle
        r="13.6"
        fill="none"
        stroke="#F3D79A"
        strokeWidth="1"
        strokeDasharray="1.6 2.2"
        strokeLinecap="round"
      />
      <Path d="M-10 0 Q0 -8.6 10 0 Q0 8.6 -10 0Z" fill={tone("#FBF3E6")} />
      <Circle r="4.8" fill="#3E2A66" />
      <Circle r="2" fill="#E8A33D" />
      <Circle cx="-1.4" cy="-1.6" r="1" fill="#FFFFFF" />
    </Svg>
  );
}
