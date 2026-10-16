import { useQuery } from "@tanstack/react-query";

import {
  getHeritage,
  getSource,
  getSources,
  getHeritageItem,
  getToponym,
  getToponyms,
} from "../services/heritage.service";
import type { HeritageCategory } from "../types/heritage";

export function useHeritage(category?: HeritageCategory) {
  return useQuery({
    queryKey: ["heritage", category ?? "all"],
    queryFn: () => getHeritage(category),
  });
}

export function useHeritageItem(heritageId: number) {
  return useQuery({
    queryKey: ["heritage", heritageId],
    queryFn: () => getHeritageItem(heritageId),
    enabled: Number.isInteger(heritageId) && heritageId > 0,
  });
}

export function useToponyms(search?: string) {
  return useQuery({
    queryKey: ["toponyms", search ?? ""],
    queryFn: () => getToponyms(search),
  });
}

export function useToponym(toponymId: number) {
  return useQuery({
    queryKey: ["toponyms", toponymId],
    queryFn: () => getToponym(toponymId),
    enabled: Number.isInteger(toponymId) && toponymId > 0,
  });
}

export function useSources() {
  return useQuery({
    queryKey: ["sources"],
    queryFn: getSources,
  });
}

export function useSource(sourceId: number) {
  return useQuery({
    queryKey: ["sources", sourceId],
    queryFn: () => getSource(sourceId),
    enabled: Number.isInteger(sourceId) && sourceId > 0,
  });
}
