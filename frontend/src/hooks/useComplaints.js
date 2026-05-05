// React Query accessors for complaint resources and mutations.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "../services/api";

export function useComplaints(filters = {}) {
  const { page = 1, limit = 10, status, category, urgency } = filters;
  return useQuery({
    queryKey: ["complaints", { page, limit, status, category, urgency }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit)
      });
      if (status) params.set("status", status);
      if (category) params.set("category", category);
      if (urgency) params.set("urgency", urgency);
      const res = await api.get(`/complaints?${params.toString()}`);
      return res.data;
    }
  });
}

export function useMyComplaints(filters = {}) {
  const { page = 1, limit = 20, status, category, urgency } = filters;
  return useQuery({
    queryKey: ["complaints", "mine", { page, limit, status, category, urgency }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit)
      });
      if (status) params.set("status", status);
      if (category) params.set("category", category);
      if (urgency) params.set("urgency", urgency);
      const res = await api.get(`/complaints/mine?${params.toString()}`);
      return res.data;
    }
  });
}

export function useComplaint(id) {
  return useQuery({
    queryKey: ["complaint", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await api.get(`/complaints/${id}`);
      return res.data.data;
    }
  });
}

export function useCreateComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ formData, onProgress }) =>
      api.post("/complaints", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: onProgress
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["complaints"], exact: false });
    }
  });
}

export function useUpdateComplaintStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, note }) =>
      api.patch(`/complaints/${id}/status`, { status, note }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["complaints"] });
      qc.invalidateQueries({ queryKey: ["complaint", vars.id] });
    }
  });
}

export function useAssignComplaintDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, departmentId }) =>
      api.patch(`/complaints/${id}/assign`, { departmentId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["complaints"] });
      qc.invalidateQueries({ queryKey: ["departments"] });
    }
  });
}
