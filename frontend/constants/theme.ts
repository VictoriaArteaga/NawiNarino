export const lightColors = {
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
  };

/** Paleta oscura: fondos verde-negro cálidos, textos crema, acentos un poco más claros para que se lean. */
export const darkColors: typeof lightColors = {
  canvas: "#121A16",
  surface: "#1B2620",
  surfaceWhite: "#243029",
  ink: "#EDE6D6",
  body: "#C8D1CA",
  muted: "#9CA89F",
  primary: "#3C8C64",
  primaryDark: "#1F4D3A",
  softGreen: "#22362B",
  accent: "#DD5A2C",
  accentSoft: "#3B2A23",
  gold: "#E8A33D",
  goldDark: "#F0C070",
  goldSoft: "#3B3322",
  blue: "#5B9BD0",
  blueDark: "#9CC6EC",
  blueSoft: "#20323F",
  purple: "#8B66C9",
  purpleDark: "#3E2A66",
  purpleDeep: "#D2BFF2",
  purpleSoft: "#30284A",
  purpleTint: "#262036",
  purpleBorder: "#5B4A85",
  border: "#2D3B33",
  track: "#2D3B33",
  mockBackground: "#3A2F1A",
  mockText: "#F0D9A8",
  danger: "#F28B82",
  softDanger: "#3D2422",
};

/**
 * Colores de título/encabezado: en claro es el verde profundo de la marca; en oscuro, un verde claro.
 * (primaryDark se queda para los fondos verdes, que siguen oscuros en los dos modos.)
 */
const headingByMode = { light: "#1F4D3A", dark: "#CFE8D9" };

export const theme = {
  colors: { ...lightColors, heading: headingByMode.light },
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

let darkActive = false;

/** Cambia la paleta en uso. Se llama antes de dibujar la pantalla; los componentes leen theme.colors al renderizar. */
export function applyPalette(dark: boolean) {
  darkActive = dark;
  Object.assign(theme.colors, dark ? darkColors : lightColors, {
    heading: dark ? headingByMode.dark : headingByMode.light,
  });
}

export function isDarkPalette() {
  return darkActive;
}

/** Equivalente oscuro de los colores claros sueltos (fondos suaves, bordes y textos de las tarjetas). */
const DARK_TONES: Record<string, string> = {
  "#FFFFFF": "#243029",
  "#FBF3E6": "#1B2620",
  "#F5EDE0": "#121A16",
  "#E3D8EE": "#3A3550",
  "#8A8472": "#A39D8B",
  "#8A7BA8": "#A596C4",
  "#1F5C3A": "#8FD0A9",
  "#C84A1F": "#E0623A",
  "#2F6F4E": "#3C8C64",
  "#6B4A9E": "#8B66C9",
  "#FBE3D6": "#3B2A23",
  "#E4EFE6": "#22362B",
  "#5E5A6B": "#A9A4B8",
  "#6A6477": "#A9A4B8",
  "#4B554F": "#B5C0B8",
  "#33423B": "#C8D1CA",
  "#33323A": "#C8D1CA",
  "#2B2A33": "#D8D5DE",
  "#23302A": "#EDE6D6",
  "#2D1B52": "#D2BFF2",
  "#3F2670": "#CDB8F2",
  "#4A2F78": "#D2BFF2",
  "#9A1C14": "#F0877D",
  "#F8E4C0": "#3B3322",
  "#F0E6D3": "#2D3B33",
  "#E6DDF3": "#30284A",
  "#D9CBB0": "#3A4A41",
  "#CFE0D2": "#26382E",
  "#1D4A75": "#9CC6EC",
  "#FDF0E6": "#2A211C",
  "#FBE4E1": "#3D2422",
  "#F8F4FC": "#231F2F",
  "#F3D3CD": "#4A2B28",
  "#F1EAF8": "#2A2438",
  "#F1E6D0": "#2D3B33",
  "#EFE8F8": "#2A2438",
  "#E6DAC4": "#2D3B33",
  "#DCEBDD": "#26382E",
  "#DCEAF6": "#20323F",
  "#8E2F22": "#F0A99C",
  "#4A4740": "#9CA89F",
  "#25674F": "#8FD0A9",
  "#6A6A62": "#A9B1AB",
  "#3B4540": "#C8D1CA",
  "#8A5200": "#F0C070",
  "#1F4D3A": "#8FD0A9",
  "#7A4A05": "#F0C98A",
  "#D9E9F4": "#20323F",
  "rgba(251,243,230,0.9)": "rgba(27,38,32,0.92)",
  "rgba(251,243,230,0.7)": "rgba(27,38,32,0.8)",
  "rgba(251,243,230,0.94)": "rgba(27,38,32,0.95)",
  "rgba(251,243,230,0.96)": "rgba(27,38,32,0.96)",
  "rgba(251,247,238,0.96)": "rgba(27,38,32,0.96)",
};

/** Devuelve el color tal cual en modo claro y su equivalente oscuro en modo oscuro. */
export function tone(color: string): string {
  if (!darkActive) return color;
  const known = DARK_TONES[color.toUpperCase()] ?? DARK_TONES[color];
  if (known !== undefined) return known;
  return /^#[0-9A-Fa-f]{6}$/.test(color) ? adaptByLightness(color) : color;
}

/** Colores sueltos que no están en la tabla: los oscuros (textos) se aclaran y los muy claros (fondos suaves) se oscurecen. */
function adaptByLightness(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (l > 0.38 && l < 0.84) return hex; // tonos medios (acentos, grises): se dejan
  const d = max - min;
  const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const targetL = l <= 0.38 ? 0.78 : 0.17;
  const s2 = Math.min(sat, 0.55);
  const c = (1 - Math.abs(2 * targetL - 1)) * s2;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = targetL - c / 2;
  const [r1, g1, b1] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  const to = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${to(r1)}${to(g1)}${to(b1)}`;
}
