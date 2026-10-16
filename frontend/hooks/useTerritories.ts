import { useQuery } from "@tanstack/react-query";

import { getTerritories, getTerritory } from "../services/territories.service";

export function useTerritories() {
  return useQuery({
    queryKey: ["territories"],
    queryFn: getTerritories,
  });
}

export function useTerritory(territoryId: number) {
  return useQuery({
    queryKey: ["territories", territoryId],
    queryFn: () => getTerritory(territoryId),
    enabled: Number.isInteger(territoryId) && territoryId > 0,
  });
}
