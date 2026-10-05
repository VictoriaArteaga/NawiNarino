import apiClient from "./api";
import type { CulturalContent, Language, LanguageDetail } from "../types/language";

export async function getLanguages(): Promise<Language[]> {
  const response = await apiClient.get<Language[]>("/languages");
  return response.data;
}

export async function getLanguage(languageId: number): Promise<LanguageDetail> {
  const response = await apiClient.get<LanguageDetail>(`/languages/${languageId}`);
  return response.data;
}

export async function getCulturalContent(
  languageId: number,
): Promise<CulturalContent[]> {
  const response = await apiClient.get<CulturalContent[]>(
    `/languages/${languageId}/culture`,
  );
  return response.data;
}

