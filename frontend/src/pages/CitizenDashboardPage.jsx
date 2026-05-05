// Citizen landing view after authentication with quick navigation shortcuts.
import { Link } from "react-router-dom";
import { FilePlus2, ListChecks, LayoutDashboard } from "lucide-react";

import useAuthStore from "../store/authStore";

export default function CitizenDashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-8 py-6">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-indigo-500/20 p-3">
          <LayoutDashboard className="h-8 w-8 text-indigo-300" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-slate-400">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}. Manage complaints from here.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/submit"
          className="glass-card flex items-center gap-4 p-6 transition hover:border-indigo-500/40"
        >
          <FilePlus2 className="h-10 w-10 text-indigo-400" />
          <div>
            <p className="font-semibold text-white">New complaint</p>
            <p className="text-sm text-slate-400">Report an issue with photos and map location.</p>
          </div>
        </Link>
        <Link
          to="/my-complaints"
          className="glass-card flex items-center gap-4 p-6 transition hover:border-indigo-500/40"
        >
          <ListChecks className="h-10 w-10 text-cyan-400" />
          <div>
            <p className="font-semibold text-white">My complaints</p>
            <p className="text-sm text-slate-400">Filter, review, and open detailed tracking.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
