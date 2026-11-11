import cellData from "./narinoCells.json";
import data from "./peopleZones.json";

export type PeopleKey = "awa" | "pasto" | "quillacinga" | "inga" | "aingae" | "nasa";

export interface PeopleZone {
  key: PeopleKey;
  /** Nombre corto para la leyenda y los selectores. */
  label: string;
  color: string;
  /** false = pueblo que ya no tiene una lengua propia en uso (Pasto y Quillacinga). */
  livingLanguage: boolean;
  /** Dónde se recorta la zona: dentro de Nariño, también en Putumayo/Cauca, o sin zona dibujada. */
  clip: "nar" | "any" | "none";
  /** Documento del corpus de donde salen los municipios. */
  source: string;
  /** Polígonos (coordenadas del mapa de 390×520). */
  shapes: number[][][];
  pin: [number, number];
}

export const peopleZones = data.peoples as PeopleZone[];

/** Qué pueblo representa cada territorio de la base de datos (por su nombre). */
const territoryRules: [RegExp, PeopleKey][] = [
  [/awá/i, "awa"],
  [/sibundoy|\binga\b/i, "inga"],
  [/a['’]?ingae|putumayo/i, "aingae"],
  [/nasa|tierradentro|cauca/i, "nasa"],
  [/quillacinga/i, "quillacinga"],
  [/pasto/i, "pasto"],
];

export function peopleForTerritory(name: string): PeopleKey | undefined {
  return territoryRules.find(([pattern]) => pattern.test(name))?.[1];
}

export function peopleByKey(key: PeopleKey): PeopleZone {
  return peopleZones.find((p) => p.key === key) ?? peopleZones[0];
}

/** Curva cerrada suave (Catmull-Rom → Bézier) que pasa por los puntos del polígono. */
export function smoothPath(points: number[][]): string {
  const n = points.length;
  const f = (v: number) => v.toFixed(1);
  let d = `M${f(points[0][0])} ${f(points[0][1])}`;
  for (let i = 0; i < n; i += 1) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return `${d}Z`;
}

/** Celda del mosaico del mapa: pertenece a un pueblo (k) o a «otras comunidades» (null). */
export interface MapCell {
  p: string; // puntos del polígono
  cx: number;
  cy: number;
  k: PeopleKey | null;
  g: "nar" | "put"; // dibujada dentro de Nariño o solo dentro de Putumayo
  s: number; // variación de tono (-1 a 1) para que el mosaico no se vea plano
}

export const mapCells = cellData.cells as MapCell[];

/** Tonos de arena para el territorio donde no vive ninguno de los pueblos de la app. */
export const OTHER_COLORS = ["#EBDDBB", "#E4D5AE", "#F0E3C6", "#DFD1AA", "#E8DBB8"];

function shade(hex: string, s: number): string {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const t = Math.abs(s) * 0.16;
  const target = s > 0 ? 255 : 0;
  const [r, g, b] = channels.map((v) => Math.round(v + (target - v) * t));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export function cellColor(cell: MapCell, index: number): string {
  return cell.k ? shade(peopleByKey(cell.k).color, cell.s) : OTHER_COLORS[index % OTHER_COLORS.length];
}

/**
 * Pregunta que el botón de ubicación le hace a Ñawi sobre el territorio de cada pueblo.
 * `query` es lo que se busca en los documentos (los de a'ingae están en inglés); `label` es lo que ve la persona.
 */
export const askAbout: Record<PeopleKey, { query: string; label: string }> = {
  awa: { query: "¿Qué es el territorio del pueblo Awá?", label: "Háblame del territorio del pueblo Awá" },
  pasto: { query: "Háblame del territorio del pueblo Pasto", label: "Háblame del territorio del pueblo Pasto" },
  quillacinga: { query: "¿Qué es el pueblo Quillacinga?", label: "Háblame del territorio del pueblo Quillacinga" },
  inga: { query: "¿Dónde se habla el inga?", label: "Háblame del territorio del pueblo Inga" },
  aingae: {
    query: "A'ingae speakers Colombia Ecuador Putumayo Nariño",
    label: "Háblame del territorio del pueblo A'ingae (Cofán)",
  },
  nasa: { query: "¿Dónde se habla el nasa yuwe?", label: "Háblame del territorio del pueblo Nasa" },
};
