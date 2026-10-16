import apiClient from "./api";
import type { Territory } from "../types/territory";

export async function getTerritories(): Promise<Territory[]> {
  const response = await apiClient.get<Territory[]>("/territories");
  return response.data;
}

export async function getTerritory(territoryId: number): Promise<Territory> {
  const response = await apiClient.get<Territory>(
    `/territories/${territoryId}`,
  );
  return response.data;
}
