// Colored pill for complaint workflow status.
export default function StatusBadge({ status }) {
  const styles = {
    PENDING: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    UNDER_REVIEW: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    IN_PROGRESS: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    RESOLVED: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    REJECTED: "bg-red-500/15 text-red-300 border-red-500/30"
  };

  const cls = styles[status] || styles.PENDING;
  const label = String(status || "").replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}
    >
      {label}
    </span>
  );
}
