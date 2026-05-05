// Full-page or inline loading indicator used with Suspense and queries.
import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-indigo-400">
      <Loader2 className="h-10 w-10 animate-spin" aria-hidden />
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}
