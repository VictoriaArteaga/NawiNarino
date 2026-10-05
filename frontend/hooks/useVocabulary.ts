import { useQuery } from "@tanstack/react-query";

import { getVocabulary } from "../services/vocabulary.service";

export function useVocabulary(languageId: number) {
  return useQuery({
    queryKey: ["languages", languageId, "vocabulary"],
    queryFn: () => getVocabulary(languageId),
    enabled: Number.isInteger(languageId) && languageId > 0,
  });
}

