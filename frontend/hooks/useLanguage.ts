import { useQuery } from "@tanstack/react-query";

import {
  getCulturalContent,
  getLanguage,
} from "../services/languages.service";

export function useLanguage(languageId: number) {
  return useQuery({
    queryKey: ["languages", languageId],
    queryFn: () => getLanguage(languageId),
    enabled: Number.isInteger(languageId) && languageId > 0,
  });
}

export function useCulturalContent(languageId: number) {
  return useQuery({
    queryKey: ["languages", languageId, "culture"],
    queryFn: () => getCulturalContent(languageId),
    enabled: Number.isInteger(languageId) && languageId > 0,
  });
}

