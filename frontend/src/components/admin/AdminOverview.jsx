// Admin overview tab with KPI tiles and distribution charts.
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import ErrorMessage from "../ui/ErrorMessage";
import LoadingSpinner from "../ui/LoadingSpinner";
import { useStats, useTrends } from "../../hooks/useAdminStats";

const COLORS = ["#6366f1", "#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#64748b"];

export default function AdminOverview() {
  const statsQuery = useStats();
  const trendsQuery = useTrends(30);

  if (statsQuery.isLoading || trendsQuery.isLoading) {
    return <LoadingSpinner label="Loading overview..." />;
  }
  if (statsQuery.isError || trendsQuery.isError) {
    return <ErrorMessage title="Failed to load overview" />;
  }

  const stats = statsQuery.data;
  const categoryData = stats?.byCategory
    ? Object.entries(stats.byCategory)
        .map(([name, value]) => ({ name, value }))
        .filter((d) => d.value > 0)
    : [];

  const statusData = stats?.byStatus
    ? Object.entries(stats.byStatus)
        .map(([name, value]) => ({ name, value }))
        .filter((d) => d.value > 0)
    : [];

  const pending =
    (stats?.byStatus?.PENDING || 0) +
    (stats?.byStatus?.UNDER_REVIEW || 0) +
    (stats?.byStatus?.IN_PROGRESS || 0);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="glass-card border-t-4 border-t-indigo-500 p-5">
          <p className="text-sm text-slate-400">Total</p>
          <p className="mt-1 text-3xl font-bold text-white">{stats?.total ?? 0}</p>
        </div>
        <div className="glass-card border-t-4 border-t-amber-500 p-5">
          <p className="text-sm text-slate-400">Pending pipeline</p>
          <p className="mt-1 text-3xl font-bold text-white">{pending}</p>
        </div>
        <div className="glass-card border-t-4 border-t-emerald-500 p-5">
          <p className="text-sm text-slate-400">Resolved</p>
          <p className="mt-1 text-3xl font-bold text-white">{stats?.byStatus?.RESOLVED ?? 0}</p>
        </div>
        <div className="glass-card border-t-4 border-t-cyan-500 p-5">
          <p className="text-sm text-slate-400">Resolution rate</p>
          <p className="mt-1 text-3xl font-bold text-white">{stats?.resolutionRate ?? "0%"}</p>
        </div>
      </div>

      <div className="glass-card p-5">
        <p className="text-sm text-slate-400">Average resolution time</p>
        <p className="mt-1 text-2xl font-semibold text-white">
          {stats?.avgResolutionTimeHours ?? 0}{" "}
          <span className="text-base font-normal text-slate-500">hours</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel p-5">
          <h3 className="mb-4 text-lg font-semibold text-white">Complaints by category</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#e2e8f0" }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-5">
          <h3 className="mb-4 text-lg font-semibold text-white">Complaints by status</h3>
          <div className="h-72 w-full">
            {statusData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={110} label>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      color: "#e2e8f0"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-slate-500">
                No status distribution yet.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel p-5">
        <h3 className="mb-4 text-lg font-semibold text-white">Last 30 days volume</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendsQuery.data || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#e2e8f0" }}
              />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
