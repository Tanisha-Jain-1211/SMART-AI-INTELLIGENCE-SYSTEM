import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Loader2, Filter, CheckCircle, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import api from "../services/api";
import StatusBadge from "../components/badges/StatusBadge";

export default function OfficerDashboardPage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");

  // Fetch complaints
  const { data: responseData, isLoading } = useQuery({
    queryKey: ["officer-complaints"],
    queryFn: async () => {
      // For MVP, we fetch a large page of complaints. In a real app, we'd use pagination here.
      const res = await api.get("/complaints?limit=100");
      return res.data;
    }
  });

  const complaints = responseData?.data || [];

  // Status Update Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await api.patch(`/complaints/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["officer-complaints"] });
    }
  });

  const handleStatusChange = (id, newStatus) => {
    if (newStatus) {
      updateStatusMutation.mutate({ id, status: newStatus });
    }
  };

  // Filter logic
  const filteredComplaints = complaints.filter(c => {
    if (filterStatus !== "ALL" && c.status !== filterStatus) return false;
    if (filterCategory !== "ALL" && c.category !== filterCategory) return false;
    return true;
  });

  // Calculate some simple stats for the officer
  const pendingCount = complaints.filter(c => c.status === "PENDING" || c.status === "UNDER_REVIEW").length;
  const inProgressCount = complaints.filter(c => c.status === "IN_PROGRESS").length;
  const resolvedCount = complaints.filter(c => c.status === "RESOLVED").length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-indigo-400">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <p>Loading officer dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-indigo-400" />
          Officer Dashboard
        </h1>
        <p className="text-slate-400 mt-1">Review, assign, and update the status of civic complaints.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-4 border-t-4 border-t-amber-500">
          <div className="rounded-full bg-amber-500/20 p-3">
            <AlertTriangle className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Needs Attention</p>
            <p className="text-2xl font-bold text-white">{pendingCount}</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4 border-t-4 border-t-indigo-500">
          <div className="rounded-full bg-indigo-500/20 p-3">
            <Clock className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">In Progress</p>
            <p className="text-2xl font-bold text-white">{inProgressCount}</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4 border-t-4 border-t-emerald-500">
          <div className="rounded-full bg-emerald-500/20 p-3">
            <CheckCircle className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Resolved</p>
            <p className="text-2xl font-bold text-white">{resolvedCount}</p>
          </div>
        </div>
      </div>

      {/* Workspace Panel */}
      <div className="glass-panel overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-700/50 flex flex-wrap gap-4 items-center bg-slate-800/30">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Filter size={18} className="text-indigo-400" />
            Filters:
          </div>
          
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
          >
            <option value="ALL">All Categories</option>
            <option value="ROADS">Roads</option>
            <option value="ELECTRICITY">Electricity</option>
            <option value="WATER">Water</option>
            <option value="GARBAGE">Garbage</option>
            <option value="STREET_LIGHTS">Street Lights</option>
            <option value="EDUCATION">Education</option>
            <option value="PUBLIC_SAFETY">Public Safety</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Complaints Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-800/50 text-xs uppercase text-slate-500 border-b border-slate-700/50">
              <tr>
                <th className="px-6 py-4 font-medium">Complaint Info</th>
                <th className="px-6 py-4 font-medium">Category/Urgency</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Current Status</th>
                <th className="px-6 py-4 font-medium text-right">Update Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    No complaints match your filters.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/track/${complaint.id}`} className="font-medium text-indigo-300 hover:text-indigo-200 line-clamp-1 transition-colors">
                        {complaint.title}
                      </Link>
                      <p className="text-xs font-mono text-slate-500 mt-1">#{complaint.id.split('-')[0]}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{complaint.category}</div>
                      <div className={`text-xs mt-1 ${
                        complaint.urgency === 'CRITICAL' ? 'text-red-400' :
                        complaint.urgency === 'HIGH' ? 'text-orange-400' :
                        complaint.urgency === 'MEDIUM' ? 'text-yellow-400' : 'text-blue-400'
                      }`}>
                        {complaint.urgency}
                      </div>
                    </td>
                    <td className="px-6 py-4">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Update Status Dropdown */}
                      <select 
                        className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded focus:ring-indigo-500 focus:border-indigo-500 p-1.5 ml-auto block"
                        value={complaint.status}
                        onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                        disabled={updateStatusMutation.isPending}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
