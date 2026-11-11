import { useId } from "react";
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path } from "react-native-svg";

import { tone } from "../constants/theme";
interface AvatarProps {
  size?: number;
  /** Draws the orange progress ring used on the profile screens. */
  ring?: boolean;
  /** 0–100: how much of the ring is filled (only when `ring` is set). */
  progress?: number;
  accessibilityLabel?: string;
}

/** Illustrated default avatar for the local "Explorador/a Ñawi" profile. */
export function Avatar({
  size = 96,
  ring = false,
  progress,
  accessibilityLabel = "Avatar de Explorador/a Ñawi",
}: AvatarProps) {
  const clipId = `av${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const radius = ring ? 36 : 47;
  const circumference = 2 * Math.PI * 40;
  const dash =
    progress === undefined ? circumference : (circumference * progress) / 100;

  return (
    <Svg
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      width={size}
      height={size}
      viewBox="0 0 96 96"
    >
      <Defs>
        <ClipPath id={clipId}>
          <Circle cx="48" cy="48" r={radius} />
        </ClipPath>
      </Defs>
      {ring ? (
        <>
          <Circle cx="48" cy="48" r="47" fill={tone("#F5EDE0")} />
          <Circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke={tone("#E6DAC4")}
            strokeWidth="4"
          />
          <Circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke={tone("#C84A1F")}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            transform="rotate(-90 48 48)"
          />
        </>
      ) : null}
      <Circle cx="48" cy="48" r={radius} fill={tone("#2F6F4E")} />
      <G clipPath={`url(#${clipId})`}>
        <Ellipse cx="48" cy="44" rx="13" ry="15" fill="#D9A06F" />
        <Path
          d="M34 44 C32 26 44 22 50 23 C62 24 64 36 62 46 C60 36 56 32 48 32 C42 32 37 36 34 44Z"
          fill="#1B1B1B"
        />
        <Path
          d="M6 100 C10 74 28 64 48 64 C68 64 86 74 90 100Z"
          fill={tone("#C84A1F")}
        />
        <Path d="M39 66 L48 77 L57 66Z" fill="#E8A33D" />
      </G>
    </Svg>
  );
}
