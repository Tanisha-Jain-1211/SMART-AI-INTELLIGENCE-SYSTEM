import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { PlusCircle, Loader2, AlertTriangle } from "lucide-react";
import api from "../services/api";
import ComplaintCard from "../components/ComplaintCard";

export default function MyComplaintsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-complaints"],
    queryFn: async () => {
      const res = await api.get("/complaints");
      return res.data.data;
    }
  });

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">My Complaints</h1>
          <p className="text-slate-400 mt-1">Track and manage the issues you've reported.</p>
        </div>
        <Link
          to="/submit"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:bg-indigo-500 hover:-translate-y-0.5 transition-all"
        >
          <PlusCircle className="h-5 w-5" />
          New Complaint
        </Link>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-indigo-400">
          <Loader2 className="h-10 w-10 animate-spin mb-4" />
          <p>Loading your complaints...</p>
        </div>
      )}

      {isError && (
        <div className="glass-panel p-8 text-center text-red-400">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h3 className="text-lg font-semibold">Failed to load complaints</h3>
          <p className="text-sm mt-2 opacity-80">Please try refreshing the page or logging in again.</p>
        </div>
      )}

      {!isLoading && !isError && data?.length === 0 && (
        <div className="glass-panel p-16 text-center border-dashed border-2 border-slate-700/50">
          <div className="bg-slate-800/50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <PlusCircle className="h-10 w-10 text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No complaints yet</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            You haven't reported any issues yet. Help us build a better city by reporting problems in your neighborhood.
          </p>
          <Link
            to="/submit"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-6 py-3 font-medium text-white hover:bg-slate-700 hover:text-indigo-300 transition-colors border border-slate-700"
          >
            Report an Issue Now
          </Link>
        </div>
      )}

      {!isLoading && !isError && data?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))}
        </div>
      )}
    </div>
  );
}
