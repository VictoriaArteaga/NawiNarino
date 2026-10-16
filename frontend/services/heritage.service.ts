import apiClient from "./api";
import type { Heritage, HeritageCategory, Toponym } from "../types/heritage";
import type { Source } from "../types/source";

export async function getHeritage(
  category?: HeritageCategory,
): Promise<Heritage[]> {
  const response = await apiClient.get<Heritage[]>("/heritage", {
    params: category ? { category } : undefined,
  });
  return response.data;
}

export async function getHeritageItem(heritageId: number): Promise<Heritage> {
  const response = await apiClient.get<Heritage>(`/heritage/${heritageId}`);
  return response.data;
}

export async function getToponyms(search?: string): Promise<Toponym[]> {
  const response = await apiClient.get<Toponym[]>("/toponyms", {
    params: search ? { search } : undefined,
  });
  return response.data;
}

export async function getToponym(toponymId: number): Promise<Toponym> {
  const response = await apiClient.get<Toponym>(`/toponyms/${toponymId}`);
  return response.data;
}

export async function getSources(): Promise<Source[]> {
  const response = await apiClient.get<Source[]>("/sources");
  return response.data;
}

export async function getSource(sourceId: number): Promise<Source> {
  const response = await apiClient.get<Source>(`/sources/${sourceId}`);
  return response.data;
}
