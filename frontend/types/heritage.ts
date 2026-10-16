import type { Source } from "./source";

export type HeritageCategory =
  | "historical"
  | "linguistic"
  | "cultural"
  | "toponymy";

export interface Heritage {
  id: number;
  title: string;
  description: string;
  category: HeritageCategory;
  dateLabel: string | null;
  imageUrl: string | null;
  sourceId: number | null;
  territoryId: number | null;
  isMock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Toponym {
  id: number;
  name: string;
  description: string;
  meaning: string;
  historicalContext: string;
  territoryId: number | null;
  sourceId: number | null;
  isMock: boolean;
  createdAt: string;
  updatedAt: string;
  source: Source | null;
}
