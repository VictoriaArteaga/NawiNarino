import { useQuery } from "@tanstack/react-query";

import { getLanguages } from "../services/languages.service";

export function useLanguages() {
  return useQuery({
    queryKey: ["languages"],
    queryFn: getLanguages,
  });
}

