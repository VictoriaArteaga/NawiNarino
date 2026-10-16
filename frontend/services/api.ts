import axios from "axios";

interface ApiErrorResponse {
  detail?: unknown;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number | undefined,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getDetailMessage(detail: unknown): string | undefined {
  if (typeof detail === "string") return detail;
  if (!Array.isArray(detail)) return undefined;

  const messages = detail.flatMap((issue: unknown) => {
    if (
      typeof issue === "object" &&
      issue !== null &&
      "msg" in issue &&
      typeof issue.msg === "string"
    ) {
      return [issue.msg];
    }
    return [];
  });

  return messages.length > 0 ? messages.join("; ") : undefined;
}

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL?.trim() || "http://localhost:8000",
  timeout: 10_000,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      const status = error.response?.status;
      const serverMessage = getDetailMessage(error.response?.data?.detail);
      const message =
        status !== undefined && status >= 500
          ? "The service could not complete the request. Please try again later."
          : serverMessage ?? error.message;
      return Promise.reject(new ApiError(message, status));
    }

    return Promise.reject(error);
  },
);

export default apiClient;
