// React Query mutations and queries for authentication flows.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "../services/api";
import useAuthStore from "../store/authStore";

export function useMe(enabled = true) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["me"],
    enabled: Boolean(enabled && token),
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return res.data.data;
    }
  });
}

export function useLogin() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/auth/login", payload);
      return res.data.data;
    },
    onSuccess: (data) => {
      setToken(data.accessToken);
      setUser(data.user);
      qc.invalidateQueries({ queryKey: ["me"] });
    }
  });
}

export function useRegister() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/auth/register", payload);
      return res.data.data;
    },
    onSuccess: (data) => {
      setToken(data.accessToken);
      setUser(data.user);
      qc.invalidateQueries({ queryKey: ["me"] });
    }
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const logoutLocal = useAuthStore((s) => s.logout);
  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSettled: () => {
      logoutLocal();
      qc.clear();
    }
  });
}
