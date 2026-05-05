// Administrative user directory with inline role updates.
import { useState } from "react";
import toast from "react-hot-toast";

import ErrorMessage from "../ui/ErrorMessage";
import LoadingSpinner from "../ui/LoadingSpinner";
import { useAdminUsers, useUpdateUserRole } from "../../hooks/useAdminStats";

const ROLES = ["CITIZEN", "OFFICER", "ADMIN"];

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const query = useAdminUsers(page, 15, roleFilter || undefined);
  const updateRole = useUpdateUserRole();

  const onRoleChange = async (id, role) => {
    try {
      await updateRole.mutateAsync({ id, role });
      toast.success("Role updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update role");
    }
  };

  if (query.isLoading) return <LoadingSpinner />;
  if (query.isError) return <ErrorMessage title="Failed to load users" />;

  const users = query.data?.data || [];
  const meta = query.data?.meta;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
          value={roleFilter}
          onChange={(e) => {
            setPage(1);
            setRoleFilter(e.target.value);
          }}
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
          <thead className="bg-slate-900/80 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/40">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                <td className="px-4 py-3 text-slate-400">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-xs font-semibold text-indigo-200 ring-1 ring-indigo-500/30">
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{u.phone || "—"}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <select
                    className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200"
                    defaultValue={u.role}
                    onChange={(e) => onRoleChange(u.id, e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>
          Page {meta?.page || 1} / {meta?.totalPages || 1}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            className="rounded border border-slate-700 px-3 py-1 disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <button
            type="button"
            disabled={meta && page >= meta.totalPages}
            className="rounded border border-slate-700 px-3 py-1 disabled:opacity-40"
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
