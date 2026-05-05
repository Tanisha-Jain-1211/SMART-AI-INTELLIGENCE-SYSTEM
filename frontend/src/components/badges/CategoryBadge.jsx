// Compact category label for complaint cards and tables.
export default function CategoryBadge({ category }) {
  return (
    <span className="rounded-md bg-slate-800/90 px-2 py-0.5 text-xs font-medium text-indigo-200 ring-1 ring-indigo-500/30">
      {category}
    </span>
  );
}
