import type { ComponentType } from "react";
import type { SvgProps } from "react-native-svg";

import { AwaHero } from "../components/art/AwaHero";
import { AwaPortrait } from "../components/art/AwaPortrait";
import { CofanHero } from "../components/art/CofanHero";
import { CofanPortrait } from "../components/art/CofanPortrait";
import { IngaHero } from "../components/art/IngaHero";
import { IngaPortrait } from "../components/art/IngaPortrait";
import { NasaHero } from "../components/art/NasaHero";
import { NasaPortrait } from "../components/art/NasaPortrait";

export type LanguageKey = "awa" | "inga" | "nasa" | "cofan" | "other";

export interface LanguageTheme {
  key: LanguageKey;
  /** Name of the people, used in "Lengua del pueblo …". */
  people: string;
  /** Card gradient: dark (bottom-left) → light (top-right). */
  dark: string;
  light: string;
  /** Title color on light backgrounds. */
  title: string;
  /** Soft tint and icon color for small badges. */
  soft: string;
  icon: string;
  /** Ring/legend color. */
  ring: string;
  Hero: ComponentType<SvgProps>;
  Portrait: ComponentType<SvgProps> | null;
}

const themes: Record<LanguageKey, LanguageTheme> = {
  awa: {
    key: "awa",
    people: "Awá",
    dark: "#2E5B48",
    light: "#628060",
    title: "#1F4D3A",
    soft: "#E4EFE6",
    icon: "#2F6F4E",
    ring: "#2F6F4E",
    Hero: AwaHero,
    Portrait: AwaPortrait,
  },
  inga: {
    key: "inga",
    people: "Inga",
    dark: "#D48A30",
    light: "#E8B35C",
    title: "#7A4A00",
    soft: "#FBE9C8",
    icon: "#7A4A00",
    ring: "#B9701A",
    Hero: IngaHero,
    Portrait: IngaPortrait,
  },
  nasa: {
    key: "nasa",
    people: "Nasa",
    dark: "#2A5E8F",
    light: "#4F7FA9",
    title: "#1D4A75",
    soft: "#DCEAF6",
    icon: "#1D4A75",
    ring: "#2A5E8F",
    Hero: NasaHero,
    Portrait: NasaPortrait,
  },
  cofan: {
    key: "cofan",
    people: "Cofán",
    dark: "#6C3F78",
    light: "#855794",
    title: "#4A2F78",
    soft: "#E6DDF3",
    icon: "#4A2F78",
    ring: "#6C3F78",
    Hero: CofanHero,
    Portrait: CofanPortrait,
  },
  other: {
    key: "other",
    people: "",
    dark: "#2E5B48",
    light: "#628060",
    title: "#1F4D3A",
    soft: "#E4EFE6",
    icon: "#2F6F4E",
    ring: "#2F6F4E",
    Hero: AwaHero,
    Portrait: null,
  },
};

function normalize(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’`´]/g, "")
    .toLowerCase()
    .trim();
}

/** Picks the visual identity of a language from its (demonstration) record name. */
export function getLanguageTheme(name: string | undefined): LanguageTheme {
  const n = normalize(name ?? "");
  if (n.includes("awa")) return themes.awa;
  if (n.includes("nasa")) return themes.nasa;
  if (n.includes("cofan") || n.includes("aingae")) return themes.cofan;
  if (n.includes("inga")) return themes.inga;
  return themes.other;
}

const order: LanguageKey[] = ["awa", "inga", "nasa", "cofan", "other"];

/** Sorts language records in the order used by the designs (Awá, Inga, Nasa, Cofán). */
export function sortLanguages<T extends { name: string }>(languages: T[]): T[] {
  return [...languages].sort(
    (a, b) =>
      order.indexOf(getLanguageTheme(a.name).key) -
      order.indexOf(getLanguageTheme(b.name).key),
  );
}
