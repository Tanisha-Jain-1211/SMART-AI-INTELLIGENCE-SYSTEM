export default function StatusBadge({ status }) {
  const getStyles = () => {
    switch (status) {
      case "RESOLVED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "IN_PROGRESS":
      case "UNDER_REVIEW":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "REJECTED":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "PENDING":
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const formattedStatus = status.replace("_", " ");

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyles()}`}>
      {formattedStatus}
    </span>
  );
}
