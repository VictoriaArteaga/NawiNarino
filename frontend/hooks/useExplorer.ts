import { useMutation } from "@tanstack/react-query";

import { askExplorer } from "../services/explorer.service";
import type { AskRequest } from "../types/explorer";

export function useAskExplorer() {
  return useMutation({
    mutationFn: (request: AskRequest) => askExplorer(request),
  });
}
