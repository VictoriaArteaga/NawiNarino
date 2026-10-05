import type { Vocabulary } from "./vocabulary";

export interface Language {
  id: number;
  name: string;
  shortDescription: string;
  isMock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LanguageDetail extends Language {
  culturalDescription: string;
  culturalContents: CulturalContent[];
  vocabulary: Vocabulary[];
}

export interface CulturalContent {
  id: number;
  languageId: number;
  title: string;
  description: string;
  imageUrl: string | null;
  isMock: boolean;
  createdAt: string;
  updatedAt: string;
}
