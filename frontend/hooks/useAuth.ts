import { useMutation, useQueryClient } from "@tanstack/react-query";

import { changePassword, login, register, updateProfile } from "../services/auth.service";
import { useAuthStore } from "../store/authStore";
import type { ChangePasswordPayload, LoginPayload, RegisterPayload } from "../types/auth";

export function useLogin() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (session) => {
      queryClient.clear(); // nada de datos de otra sesión
      setSession(session);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: (session) => {
      queryClient.clear();
      setSession(session);
    },
  });
}

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (name: string) => updateProfile(name),
    onSuccess: (user) => setUser(user),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((s) => s.clearSession);
  return () => {
    clearSession();
    queryClient.clear();
  };
}
