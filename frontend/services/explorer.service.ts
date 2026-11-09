import apiClient from "./api";
import type { AskRequest, ExplorerAnswer } from "../types/explorer";

export async function askExplorer(request: AskRequest): Promise<ExplorerAnswer> {
  // Con generación local (CPU) una respuesta puede tardar decenas de segundos.
  const response = await apiClient.post<ExplorerAnswer>("/explorer/ask", request, {
    timeout: 120_000,
  });
  return response.data;
}
