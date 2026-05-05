// Empty list placeholder with optional action slot.
export default function EmptyState({ title, description, children }) {
  return (
    <div className="glass-panel border border-dashed border-slate-700/60 p-12 text-center">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">{description}</p>
      ) : null}
      {children ? <div className="mt-6 flex justify-center">{children}</div> : null}
    </div>
  );
}
