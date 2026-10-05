import apiClient from "./api";
import type { Vocabulary } from "../types/vocabulary";

export async function getVocabulary(languageId: number): Promise<Vocabulary[]> {
  const response = await apiClient.get<Vocabulary[]>(
    `/languages/${languageId}/vocabulary`,
  );
  return response.data;
}

