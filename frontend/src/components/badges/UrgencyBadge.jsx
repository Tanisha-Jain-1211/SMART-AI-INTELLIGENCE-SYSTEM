// Urgency indicator with consistent color coding across the UI.
const MAP = {
  LOW: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  MEDIUM: "bg-yellow-500/15 text-yellow-200 border-yellow-500/25",
  HIGH: "bg-orange-500/15 text-orange-300 border-orange-500/25",
  CRITICAL: "bg-red-500/15 text-red-300 border-red-500/25"
};

export default function UrgencyBadge({ urgency }) {
  const cls = MAP[urgency] || MAP.MEDIUM;
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}
    >
      {urgency}
    </span>
  );
}
