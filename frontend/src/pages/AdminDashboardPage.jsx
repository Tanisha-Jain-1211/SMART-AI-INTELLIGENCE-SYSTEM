import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Loader2, AlertTriangle, Users, FileText, CheckCircle, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge";

const COLORS = ['#6366f1', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#64748b'];

export default function AdminDashboardPage() {
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await api.get("/admin/stats");
      return res.data.data;
    }
  });

  const { data: trends, isLoading: isTrendsLoading } = useQuery({
    queryKey: ["admin-trends"],
    queryFn: async () => {
      const res = await api.get("/admin/trends?days=7");
      return res.data.data;
    }
  });

  const { data: recentComplaints, isLoading: isComplaintsLoading } = useQuery({
    queryKey: ["admin-complaints"],
    queryFn: async () => {
      const res = await api.get("/complaints?limit=5");
      return res.data.data;
    }
  });

  const isLoading = isStatsLoading || isTrendsLoading || isComplaintsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-indigo-400">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <p>Loading dashboard analytics...</p>
      </div>
    );
  }

  // Format data for charts
  const categoryData = stats?.byCategory ? Object.entries(stats.byCategory).map(([name, value]) => ({ name, value })).filter(item => item.value > 0) : [];
  const statusData = stats?.byStatus ? Object.entries(stats.byStatus).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview of system activity and performance metrics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 flex items-center gap-4 border-t-4 border-t-indigo-500">
          <div className="rounded-full bg-indigo-500/20 p-3">
            <FileText className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Total Complaints</p>
            <p className="text-2xl font-bold text-white">{stats?.total || 0}</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4 border-t-4 border-t-emerald-500">
          <div className="rounded-full bg-emerald-500/20 p-3">
            <CheckCircle className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Resolution Rate</p>
            <p className="text-2xl font-bold text-white">{stats?.resolutionRate || "0%"}</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4 border-t-4 border-t-amber-500">
          <div className="rounded-full bg-amber-500/20 p-3">
            <Clock className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Avg Resolution Time</p>
            <p className="text-2xl font-bold text-white">{stats?.avgResolutionTimeHours || 0} <span className="text-sm font-normal text-slate-500">hrs</span></p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4 border-t-4 border-t-cyan-500">
          <div className="rounded-full bg-cyan-500/20 p-3">
            <AlertTriangle className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Pending Review</p>
            <p className="text-2xl font-bold text-white">{stats?.byStatus?.PENDING || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trends Chart */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Complaint Trends (Last 7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', strokeWidth: 2 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Chart */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Complaints by Category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} cursor={{ fill: '#334155', opacity: 0.4 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="glass-panel overflow-hidden">
        <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Recent Complaints</h3>
          <Link to="/admin/complaints" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-800/50 text-xs uppercase text-slate-500 border-b border-slate-700/50">
              <tr>
                <th className="px-6 py-4 font-medium">ID / Title</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {recentComplaints?.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-200 line-clamp-1">{complaint.title}</p>
                    <p className="text-xs font-mono text-slate-500 mt-1">#{complaint.id.split('-')[0]}</p>
                  </td>
                  <td className="px-6 py-4">{complaint.category}</td>
                  <td className="px-6 py-4">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={complaint.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/track/${complaint.id}`}
                      className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
              {recentComplaints?.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    No complaints found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
