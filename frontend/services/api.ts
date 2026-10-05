import axios from "axios";

interface ApiErrorResponse {
  detail?: string;
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
      const serverMessage = error.response?.data?.detail;
      const message =
        typeof serverMessage === "string" ? serverMessage : error.message;
      return Promise.reject(new Error(message));
    }

    return Promise.reject(error);
  },
);

export default apiClient;
