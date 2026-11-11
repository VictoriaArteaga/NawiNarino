import apiClient from "./api";
import type {
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  User,
} from "../types/auth";

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/register", payload);
  return response.data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/login", payload);
  return response.data;
}

export async function updateProfile(name: string): Promise<User> {
  const response = await apiClient.patch<User>("/auth/me", { name });
  return response.data;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await apiClient.post("/auth/change-password", payload);
}

export async function getMe(): Promise<User> {
  const response = await apiClient.get<User>("/auth/me");
  return response.data;
}
