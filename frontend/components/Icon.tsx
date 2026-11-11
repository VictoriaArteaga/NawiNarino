import Svg, { Circle, Path, Rect } from "react-native-svg";

import { tone } from "../constants/theme";
/** Icon paths copied from the approved designs (24×24 grid). */
const paths = {
  home: "M3 11l9-8 9 8v10h-6v-6H9v6H3z",
  book: "M4 5a2 2 0 0 1 2-2h6v16H6a2 2 0 0 0-2 2zM20 5a2 2 0 0 0-2-2h-6v16h6a2 2 0 0 1 2 2z",
  pin: "M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21zM12 7.5a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4z",
  pinFilled:
    "M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12zm0-9.5a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4z",
  compass: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  arrowLeft: "M19 12H5M11 6l-6 6 6 6",
  chevronRight: "M9 6l6 6-6 6",
  chevronDoubleRight: "M8 6l6 6-6 6",
  search: "M20 20l-4-4",
  speaker:
    "M4 9v6h4l5 4V5L8 9zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12",
  mic: "M5 11a7 7 0 0 0 14 0M12 18v3",
  flame: "M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-10z",
  star: "M12 2l3 7 7 .8-5.3 4.7 1.6 7L12 17.8 5.7 21.5l1.6-7L2 9.8 9 9z",
  heart:
    "M12 20s-7-4.5-8.5-9A4.5 4.5 0 0 1 12 7.5 4.5 4.5 0 0 1 20.5 11C19 15.5 12 20 12 20z",
  bell: "M6 17V11a6 6 0 1 1 12 0v6l1.5 2h-15zM10 21h4",
  edit: "M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4",
  bulb: "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z",
  check: "M5 12.5l4.5 4.5L19 7.5",
  close: "M6 6l12 12M18 6L6 18",
  send: "M4 12l16-8-6 16-3-7z",
  sparkle:
    "M12 3l2 5.5L19.5 10 14 12l-2 5.5L10 12 4.5 10 10 8.5z M18 16l.8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8z",
  map: "M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14",
  locate: "M12 2v3M12 19v3M2 12h3M19 12h3",
  chart: "M4 20V10M10 20V4M16 20v-8M22 20H2",
  bookmark: "M6 3h12v18l-6-4-6 4z",
  tasks: "M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9",
  help: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  sliders: "M4 6h16M4 12h16M4 18h16M9 4v4M15 10v4M8 16v4",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  moon: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM8.5 12l2.5 2.5 4.5-5",
  warning: "M12 3l10 18H2zM12 10v5M12 18h.01",
  dots: "M12 5h.01M12 12h.01M12 19h.01",
  translate:
    "M4 5h9M8.5 3v2M6 5c0 4 3 7 7 8M11 5c0 3-2 6-6 8M13 21l4-10 4 10M14.5 18h5",
  waves:
    "M3 17c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2 2 3 2M3 12c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2 2 3 2M12 3v4",
  library: "M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z M4 21h14",
  users:
    "M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M21 20v-1a4 4 0 0 0-3-3.9M16 4.2a3.5 3.5 0 0 1 0 6.6",
  message:
    "M21 12a8 8 0 0 1-11.8 7L4 20l1.2-4.6A8 8 0 1 1 21 12z",
  award: "M12 3l2.4 5L20 9l-4 3.9.9 5.6L12 16l-4.9 2.5.9-5.6L4 9l5.6-1z",
  landmark: "M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M3 10l9-6 9 6",
} as const;

export type IconName = keyof typeof paths;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  /** Fill color (for filled glyphs like flame, star, home). */
  fill?: string;
  strokeWidth?: number;
}

/** Stroke icon set used across the approved designs. */
export function Icon({
  name,
  size = 22,
  color = tone("#1F2D27"),
  fill = "none",
  strokeWidth = 1.9,
}: IconProps) {
  const extras = (
    <>
      {name === "search" ? <Circle cx="11" cy="11" r="7" /> : null}
      {name === "mic" ? <Rect x="9" y="3" width="6" height="12" rx="3" /> : null}
      {name === "locate" ? <Circle cx="12" cy="12" r="4" /> : null}
      {name === "gear" ? (
        <Path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
      ) : null}
    </>
  );

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {extras}
      <Path d={paths[name]} />
    </Svg>
  );
}
