// Temporal analytics with selectable horizons and textual hotspot ranking.
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import ErrorMessage from "../ui/ErrorMessage";
import LoadingSpinner from "../ui/LoadingSpinner";
import { useComplaints } from "../../hooks/useComplaints";
import { useStats, useTrends } from "../../hooks/useAdminStats";

function weekKey(isoDate) {
  const d = new Date(isoDate);
  const dayNr = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dayNr + 3);
  const firstThursday = new Date(d.getFullYear(), 0, 4);
  const week =
    1 +
    Math.round(
      ((d.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7
    );
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

export default function AdminTrends() {
  const [days, setDays] = useState(30);
  const trendsQuery = useTrends(days);
  const statsQuery = useStats();
  const samplesQuery = useComplaints({ page: 1, limit: 500 });

  const weeklyBars = useMemo(() => {
    const rows = trendsQuery.data || [];
    const buckets = {};
    rows.forEach((row) => {
      const w = weekKey(row.date);
      buckets[w] = (buckets[w] || 0) + row.count;
    });
    return Object.entries(buckets).map(([week, count]) => ({ week, count }));
  }, [trendsQuery.data]);

  const topAreas = useMemo(() => {
    const rows = samplesQuery.data?.data || [];
    const freq = {};
    rows.forEach((c) => {
      const addr = (c.address || "").trim();
      if (!addr) return;
      freq[addr] = (freq[addr] || 0) + 1;
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([address, count]) => ({ address, count }));
  }, [samplesQuery.data]);

  const categoryBars = useMemo(() => {
    const bc = statsQuery.data?.byCategory || {};
    return Object.entries(bc).map(([name, value]) => ({ name, value }));
  }, [statsQuery.data]);

  if (trendsQuery.isLoading || statsQuery.isLoading) return <LoadingSpinner />;
  if (trendsQuery.isError || statsQuery.isError) return <ErrorMessage title="Trend data unavailable" />;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDays(d)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              days === d ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Last {d} days
          </button>
        ))}
      </div>

      <div className="glass-panel p-5">
        <h3 className="mb-4 text-lg font-semibold text-white">Complaints over time</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendsQuery.data || []}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#e2e8f0" }}
              />
              <Area type="monotone" dataKey="count" stroke="#6366f1" fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel p-5">
          <h3 className="mb-4 text-lg font-semibold text-white">Weekly volume</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyBars}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="week" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#e2e8f0" }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-5">
          <h3 className="mb-4 text-lg font-semibold text-white">Category totals (system)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBars}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#e2e8f0" }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-panel p-5">
        <h3 className="mb-4 text-lg font-semibold text-white">Top complaint addresses (sample)</h3>
        {samplesQuery.isLoading ? <LoadingSpinner label="Ranking addresses..." /> : null}
        <ol className="space-y-3">
          {topAreas.map((item, idx) => (
            <li key={item.address} className="flex items-center justify-between text-sm text-slate-300">
              <span>
                <span className="mr-2 text-slate-500">{idx + 1}.</span>
                {item.address}
              </span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-indigo-300">
                {item.count}
              </span>
            </li>
          ))}
          {!topAreas.length && !samplesQuery.isLoading ? (
            <li className="text-slate-500">No addresses in the recent sample.</li>
          ) : null}
        </ol>
      </div>
    </div>
  );
}
