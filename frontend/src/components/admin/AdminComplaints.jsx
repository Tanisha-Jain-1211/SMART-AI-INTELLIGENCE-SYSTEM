// Paginated complaint queue with filters and status update workflow.
import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import CategoryBadge from "../badges/CategoryBadge";
import StatusBadge from "../badges/StatusBadge";
import UrgencyBadge from "../badges/UrgencyBadge";
import ErrorMessage from "../ui/ErrorMessage";
import LoadingSpinner from "../ui/LoadingSpinner";
import { useComplaints, useUpdateComplaintStatus } from "../../hooks/useComplaints";

const STATUSES = ["PENDING", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "REJECTED"];
const CATEGORIES = [
  "ELECTRICITY",
  "WATER",
  "ROADS",
  "GARBAGE",
  "STREET_LIGHTS",
  "EDUCATION",
  "PUBLIC_SAFETY",
  "OTHER"
];
const URGENCIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function AdminComplaints() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("");
  const [modal, setModal] = useState(null);
  const [note, setNote] = useState("");
  const [nextStatus, setNextStatus] = useState("IN_PROGRESS");

  const listQuery = useComplaints({
    page,
    limit: 12,
    status: status || undefined,
    category: category || undefined,
    urgency: urgency || undefined
  });

  const updateStatus = useUpdateComplaintStatus();

  const submitStatus = async () => {
    if (!modal) return;
    try {
      await updateStatus.mutateAsync({
        id: modal.id,
        status: nextStatus,
        note: note || undefined
      });
      toast.success("Status updated");
      setModal(null);
      setNote("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    }
  };

  if (listQuery.isLoading) return <LoadingSpinner />;
  if (listQuery.isError) return <ErrorMessage title="Could not load complaints" />;

  const complaints = listQuery.data?.data || [];
  const meta = listQuery.data?.meta;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
          value={category}
          onChange={(e) => {
            setPage(1);
            setCategory(e.target.value);
          }}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
          value={urgency}
          onChange={(e) => {
            setPage(1);
            setUrgency(e.target.value);
          }}
        >
          <option value="">All urgency</option>
          {URGENCIES.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
          <thead className="bg-slate-900/80 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Urgency</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/40">
            {complaints.map((row) => (
              <tr key={row.id} className="hover:bg-slate-900/60">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.id.slice(0, 8)}…</td>
                <td className="max-w-xs px-4 py-3 text-slate-200 line-clamp-2">{row.title}</td>
                <td className="px-4 py-3 text-slate-400">{row.user?.name || "—"}</td>
                <td className="px-4 py-3">
                  <CategoryBadge category={row.category} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3">
                  <UrgencyBadge urgency={row.urgency} />
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(row.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setModal(row);
                      setNextStatus(row.status);
                      setNote("");
                    }}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    Update status
                  </button>
                  <Link
                    to={`/track/${row.id}`}
                    className="ml-3 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    View
                  </Link>
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

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-950 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Update status</h3>
            <p className="mt-1 text-sm text-slate-400 line-clamp-2">{modal.title}</p>
            <div className="mt-4 space-y-3">
              <label className="block text-xs font-medium text-slate-400">New status</label>
              <select
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200"
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <label className="block text-xs font-medium text-slate-400">Note (optional)</label>
              <textarea
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:text-white"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updateStatus.isPending}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                onClick={submitStatus}
              >
                {updateStatus.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
