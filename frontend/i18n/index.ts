import { Children, isValidElement, type ReactNode } from "react";

import { useSettingsStore, type AppLanguage } from "../store/settingsStore";
import en from "./en.json";

/**
 * Traducción de la interfaz. Los textos del código están en español y sirven de clave:
 * en inglés se busca su traducción en `en.json`; si no existe, se muestra el original.
 * Casi todo el texto pasa por el componente T, que traduce aquí; no hace falta tocar cada pantalla.
 */

const squash = (text: string) => text.replace(/\s+/g, " ").trim();

const table = new Map<string, string>();
for (const [spanish, english] of Object.entries(en as Record<string, string>)) {
  table.set(squash(spanish).toLowerCase(), english);
}

const isUpperCase = (text: string) => text === text.toUpperCase() && text !== text.toLowerCase();

/** Textos con números o nombres dentro (no pueden ser claves fijas). */
const rules: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^Pregunta (\d+) de (\d+)$/, (m) => `Question ${m[1]} of ${m[2]}`],
  [/^Página (\d+)$/, (m) => `Page ${m[1]}`],
  [/^p\. (\d+) del PDF$/, (m) => `p. ${m[1]} of the PDF`],
  [/^Encontré esto en (\d+) fuentes:$/, (m) => `I found this in ${m[1]} sources:`],
  [/^(\d+) lenguas$/, (m) => `${m[1]} languages`],
  [/^Háblame del territorio del pueblo (.+)$/, (m) => `Tell me about the territory of the ${m[1]} people`],
  [/^(\d+) de (\d+) actividades completadas$/, (m) => `${m[1]} of ${m[2]} activities completed`],
  [/^(\d+) de (\d+) actividades$/, (m) => `${m[1]} of ${m[2]} activities`],
  [/^(\d+) palabras con fuente$/, (m) => `${m[1]} words with sources`],
  [/^Lengua del pueblo (.+)$/, (m) => `Language of the ${m[1]} people`],
  [/^¿Qué significa «(.+)»\?$/, (m) => `What does «${m[1]}» mean?`],
  [/^¿Qué número es «(.+)»\?$/, (m) => `Which number is «${m[1]}»?`],
  [/^Práctica: (.+)$/, (m) => `Practice: ${translateCore(m[1])}`],
  [/^(\d+)% total$/, (m) => `${m[1]}% total`],
  [/^(\d+) actividades?$/, (m) => `${m[1]} ${m[1] === "1" ? "activity" : "activities"}`],
  [/^(\d+) guardadas$/, (m) => `${m[1]} saved`],
  [
    /^Documento del corpus de ÑAWI-Nariño sobre (.+)\. Licencia: (.+)\.$/,
    (m) => `Document from the ÑAWI-Nariño corpus about ${m[1]}. License: ${translateCore(m[2])}.`,
  ],
];

function translateCore(core: string): string {
  const hit = table.get(squash(core).toLowerCase());
  if (hit !== undefined) return isUpperCase(core) ? hit.toUpperCase() : hit;
  if (core.includes(" · ")) return core.split(" · ").map(translateCore).join(" · ");
  for (const [pattern, build] of rules) {
    const match = core.match(pattern);
    if (match) return build(match);
  }
  return core;
}

/** Traduce un texto al idioma elegido, conservando los espacios de los extremos. */
export function translate(text: string, language: AppLanguage): string {
  if (language !== "en" || !text) return text;
  const core = text.trim();
  if (!core) return text;
  const lead = text.slice(0, text.length - text.trimStart().length);
  const trail = text.slice(text.trimEnd().length);
  return lead + translateCore(core) + trail;
}

/** Traduce los textos sueltos que hay dentro de los hijos de un componente (los elementos se dejan como están). */
export function translateNode(node: ReactNode, language: AppLanguage): ReactNode {
  if (language !== "en") return node;
  if (typeof node === "string") return translate(node, language);
  if (Array.isArray(node)) {
    return Children.map(node, (child) =>
      typeof child === "string" ? translate(child, language) : isValidElement(child) ? child : child,
    );
  }
  return node;
}

/** Función de traducción para textos que no pasan por T (marcadores de los campos, etc.). */
export function useTr() {
  const language = useSettingsStore((s) => s.language);
  return (text: string) => translate(text, language);
}
