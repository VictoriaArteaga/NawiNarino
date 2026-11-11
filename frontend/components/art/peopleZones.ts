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
