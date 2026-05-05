// Displays a consistent error panel for failed queries or mutations.
import { AlertTriangle } from "lucide-react";

export default function ErrorMessage({ title = "Something went wrong", message }) {
  return (
    <div className="glass-panel border border-red-500/30 p-6 text-center text-red-300">
      <AlertTriangle className="mx-auto mb-3 h-10 w-10 opacity-80" />
      <h3 className="text-lg font-semibold">{title}</h3>
      {message ? <p className="mt-2 text-sm text-slate-400">{message}</p> : null}
    </div>
  );
}
