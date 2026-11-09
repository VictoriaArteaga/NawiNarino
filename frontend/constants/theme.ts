export const theme = {
  colors: {
    // Base surfaces (warm cream paper, as in the approved designs)
    canvas: "#F5EDE0",
    surface: "#FBF3E6",
    surfaceWhite: "#FFFFFF",
    // Text
    ink: "#1F2D27",
    body: "#33423B",
    muted: "#5E645B",
    // Brand greens
    primary: "#2F6F4E",
    primaryDark: "#1F4D3A",
    softGreen: "#E4EFE6",
    // Accents
    accent: "#C84A1F",
    accentSoft: "#FBE3D6",
    gold: "#E8A33D",
    goldDark: "#8A5200",
    goldSoft: "#F8E4C0",
    blue: "#2E6FA8",
    blueDark: "#1D4A75",
    blueSoft: "#DCEAF6",
    purple: "#6B4A9E",
    purpleDark: "#3E2A66",
    purpleDeep: "#4A2F78",
    purpleSoft: "#E6DDF3",
    purpleTint: "#F1EAF8",
    purpleBorder: "#B9A5DB",
    // Lines and states
    border: "#EADFCB",
    track: "#E6DAC4",
    mockBackground: "#FBEBD0",
    mockText: "#5A3A05",
    danger: "#A3281C",
    softDanger: "#FBE4E1",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 20,
    xl: 28,
    xxl: 40,
  },
  radii: {
    card: 20,
    button: 14,
    pill: 999,
  },
  layout: {
    navHeight: 82,
    bandHeight: 54,
  },
};

export type FontKind = "display" | "body";

const displayFonts: Record<number, string> = {
  400: "Outfit_400Regular",
  500: "Outfit_500Medium",
  600: "Outfit_600SemiBold",
  700: "Outfit_700Bold",
  800: "Outfit_800ExtraBold",
};

const bodyFonts: Record<number, string> = {
  400: "NunitoSans_400Regular",
  500: "NunitoSans_400Regular",
  600: "NunitoSans_600SemiBold",
  700: "NunitoSans_700Bold",
  800: "NunitoSans_700Bold",
};

export function fontFamily(kind: FontKind, weight = 400, italic = false) {
  if (kind === "display") return displayFonts[weight] ?? displayFonts[600];
  if (italic) {
    return weight >= 600
      ? "NunitoSans_600SemiBold_Italic"
      : "NunitoSans_400Regular_Italic";
  }
  return bodyFonts[weight] ?? bodyFonts[400];
}

export const shadows = {
  card: {
    elevation: 3,
    shadowColor: "#32230A",
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  soft: {
    elevation: 1,
    shadowColor: "#3C280A",
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  float: {
    elevation: 4,
    shadowColor: "#32230A",
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
  },
};
