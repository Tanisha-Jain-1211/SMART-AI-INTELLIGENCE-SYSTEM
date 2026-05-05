// Landing experience with hero messaging, public metrics, and recent activity.
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, MapPinned, CheckCircle2 } from "lucide-react";

import ComplaintCard from "../components/ComplaintCard";
import ErrorMessage from "../components/ui/ErrorMessage";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { usePublicStats } from "../hooks/useAdminStats";
import { useComplaints } from "../hooks/useComplaints";

export default function HomePage() {
  const statsQuery = usePublicStats();
  const recentQuery = useComplaints({ page: 1, limit: 6 });

  return (
    <div className="flex flex-col gap-16 py-8">
      <section className="text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-300">
          Smart Complaint Intelligence System
        </p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
          Report. Track. Resolve.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
          File civic issues in minutes. AI classifies urgency and category while officers route work to
          the right department — transparently.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/submit"
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500"
          >
            Submit a complaint
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="rounded-full border border-slate-600 px-8 py-3 text-sm font-semibold text-slate-200 hover:border-slate-400"
          >
            Sign in to track
          </Link>
        </div>
      </section>

      <section>
        {statsQuery.isLoading ? <LoadingSpinner label="Loading city insights..." /> : null}
        {statsQuery.isError ? (
          <ErrorMessage title="Could not load stats" message="Try again after starting the backend API." />
        ) : null}
        {statsQuery.data ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="glass-card p-6">
              <p className="text-sm text-slate-400">Total complaints</p>
              <p className="mt-2 text-3xl font-bold text-white">{statsQuery.data.total}</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-sm text-slate-400">Resolved today</p>
              <p className="mt-2 text-3xl font-bold text-emerald-300">{statsQuery.data.resolvedToday}</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-sm text-slate-400">Avg resolution time</p>
              <p className="mt-2 text-3xl font-bold text-indigo-200">
                {statsQuery.data.avgResolutionTimeHours}{" "}
                <span className="text-base font-normal text-slate-500">hrs</span>
              </p>
            </div>
          </div>
        ) : null}
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Recent complaints</h2>
            <p className="text-sm text-slate-400">Latest submissions visible to all citizens.</p>
          </div>
          <Link to="/register" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">
            Join to report →
          </Link>
        </div>
        {recentQuery.isLoading ? <LoadingSpinner /> : null}
        {recentQuery.isError ? <ErrorMessage title="Unable to load complaints" /> : null}
        {recentQuery.data?.data?.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentQuery.data.data.map((c) => (
              <ComplaintCard key={c.id} complaint={c} />
            ))}
          </div>
        ) : null}
        {!recentQuery.isLoading && recentQuery.data?.data?.length === 0 ? (
          <p className="text-center text-slate-500">No complaints yet — be the first to report.</p>
        ) : null}
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="glass-panel p-6">
          <Sparkles className="mb-4 h-8 w-8 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">1 · Submit</h3>
          <p className="mt-2 text-sm text-slate-400">
            Describe the issue, attach a photo, and drop a map pin so crews know exactly where to go.
          </p>
        </div>
        <div className="glass-panel p-6">
          <MapPinned className="mb-4 h-8 w-8 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">2 · AI classifies</h3>
          <p className="mt-2 text-sm text-slate-400">
            Models infer category and urgency, and scan for duplicates so triage stays fast.
          </p>
        </div>
        <div className="glass-panel p-6">
          <CheckCircle2 className="mb-4 h-8 w-8 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">3 · Get resolved</h3>
          <p className="mt-2 text-sm text-slate-400">
            Officers update status while you track every milestone until closure.
          </p>
        </div>
      </section>
    </div>
  );
}
