// Authenticated citizen view listing owned complaints in a dense table layout.
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";

import CategoryBadge from "../components/badges/CategoryBadge";
import StatusBadge from "../components/badges/StatusBadge";
import UrgencyBadge from "../components/badges/UrgencyBadge";
import EmptyState from "../components/ui/EmptyState";
import ErrorMessage from "../components/ui/ErrorMessage";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useMyComplaints } from "../hooks/useComplaints";
import { getProgressPercent } from "../utils/complaintProgress";

function RowProgress({ status }) {
  try {
    const progress = getProgressPercent(status);
    const pct = progress.variant === "rejected" ? 100 : progress.percent;
    const fillClass =
      progress.variant === "rejected"
        ? "bg-red-600"
        : "bg-gradient-to-r from-indigo-600 to-emerald-500";

    return (
      <div className="mt-2 flex min-w-[140px] flex-col gap-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${fillClass}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[10px] font-semibold text-slate-500">
          {progress.variant === "rejected" ? "Rejected" : `${progress.percent}%`}
        </span>
      </div>
    );
  } catch (err) {
    console.log("[MyComplaintsPage] RowProgress", err);
    return null;
  }
}

const STATUSES = ["", "PENDING", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "REJECTED"];

export default function MyComplaintsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const query = useMyComplaints({ page, limit: 12, status: status || undefined });

  return (
    <div className="mx-auto max-w-6xl py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">My complaints</h1>
          <p className="mt-1 text-slate-400">Filtered directly via /complaints/mine.</p>
        </div>
        <Link
          to="/submit"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500"
        >
          <PlusCircle className="h-5 w-5" />
          New complaint
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</label>
        <select
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          {STATUSES.map((s) => (
            <option key={s || "all"} value={s}>
              {s ? s.replace(/_/g, " ") : "All statuses"}
            </option>
          ))}
        </select>
      </div>

      {query.isLoading ? <LoadingSpinner /> : null}
      {query.isError ? <ErrorMessage title="Unable to load your complaints" /> : null}

      {!query.isLoading && !query.isError && query.data?.data?.length === 0 ? (
        <EmptyState
          title="No complaints yet"
          description="Report infrastructure problems near you — AI assists routing instantly."
        >
          <Link
            to="/submit"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Submit issue
          </Link>
        </EmptyState>
      ) : null}

      {!query.isLoading && query.data?.data?.length ? (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
              <thead className="bg-slate-900/80 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 min-w-[160px]">Status / Progress</th>
                  <th className="px-4 py-3">Urgency</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                {query.data.data.map((row) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer hover:bg-slate-900/60"
                    onClick={() => navigate(`/track/${row.id}`)}
                  >
                    <td className="max-w-xs px-4 py-3 font-medium text-slate-100 line-clamp-2">{row.title}</td>
                    <td className="px-4 py-3">
                      <CategoryBadge category={row.category} />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                        <StatusBadge status={row.status} />
                        <span className="text-xs font-bold text-indigo-300 sm:ml-1">
                          {row.status === "REJECTED"
                            ? "100% (Rejected)"
                            : `${getProgressPercent(row.status).percent}%`}
                        </span>
                      </div>
                      <RowProgress status={row.status} />
                    </td>
                    <td className="px-4 py-3">
                      <UrgencyBadge urgency={row.urgency} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/track/${row.id}`}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
            <span>
              Page {query.data.meta?.page || 1} / {query.data.meta?.totalPages || 1}
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
                disabled={query.data.meta && page >= query.data.meta.totalPages}
                className="rounded border border-slate-700 px-3 py-1 disabled:opacity-40"
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
