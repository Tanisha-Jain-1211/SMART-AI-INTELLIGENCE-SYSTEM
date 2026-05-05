// Admin analytics and operational datasets consumed by dashboard sections.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "../services/api";

export function usePublicStats() {
  return useQuery({
    queryKey: ["public-stats"],
    queryFn: async () => {
      const res = await api.get("/public/stats");
      return res.data.data;
    }
  });
}

export function useStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await api.get("/admin/stats");
      return res.data.data;
    }
  });
}

export function useTrends(days = 30) {
  return useQuery({
    queryKey: ["admin-trends", days],
    queryFn: async () => {
      const res = await api.get(`/admin/trends?days=${days}`);
      return res.data.data;
    }
  });
}

export function useHeatmap() {
  return useQuery({
    queryKey: ["admin-heatmap"],
    queryFn: async () => {
      const res = await api.get("/admin/heatmap");
      return res.data.data;
    }
  });
}

export function useAdminUsers(page = 1, limit = 20, role) {
  return useQuery({
    queryKey: ["admin-users", page, limit, role],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit)
      });
      if (role) params.set("role", role);
      const res = await api.get(`/admin/users?${params.toString()}`);
      return res.data;
    }
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await api.get("/departments");
      return res.data.data;
    }
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }) =>
      api.patch(`/admin/users/${id}/role`, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    }
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => api.post("/departments", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
    }
  });
}
