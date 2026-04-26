import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, AlertTriangle, Clock, MapPin, CheckCircle, Tag, AlertOctagon } from "lucide-react";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge";

export default function TrackComplaintPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: complaint, isLoading, isError } = useQuery({
    queryKey: ["complaint", id],
    queryFn: async () => {
      const res = await api.get(`/complaints/${id}`);
      return res.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-indigo-400">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <p>Loading complaint details...</p>
      </div>
    );
  }

  if (isError || !complaint) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="glass-panel p-8 text-center text-red-400">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h3 className="text-lg font-semibold">Complaint Not Found</h3>
          <p className="text-sm mt-2 opacity-80 mb-6">We couldn't find the requested complaint.</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 font-medium text-white hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to List
      </button>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column - Details */}
        <div className="flex-1 space-y-6">
          <div className="glass-panel p-6 sm:p-8">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-2xl font-bold text-white leading-tight pr-4">{complaint.title}</h1>
              <StatusBadge status={complaint.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="glass-card p-4 flex flex-col gap-1">
                <span className="text-xs text-slate-400 flex items-center gap-1.5"><Tag className="h-3 w-3" /> Category</span>
                <span className="text-sm font-semibold text-slate-200">{complaint.category}</span>
              </div>
              <div className="glass-card p-4 flex flex-col gap-1">
                <span className="text-xs text-slate-400 flex items-center gap-1.5"><AlertOctagon className="h-3 w-3" /> Urgency</span>
                <span className="text-sm font-semibold text-slate-200">{complaint.urgency}</span>
              </div>
            </div>

            {complaint.aiConfidence && complaint.aiCategory && (
              <div className="mb-6 p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-xs text-indigo-300 font-medium mb-1">AI Classification Insight</p>
                <p className="text-sm text-slate-300">
                  Our AI engine categorized this issue as <span className="font-semibold text-indigo-400">{complaint.aiCategory}</span> with {Math.round(complaint.aiConfidence * 100)}% confidence.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white mb-2 border-b border-slate-700/50 pb-2">Description</h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
              </div>

              {complaint.address && (
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2 border-b border-slate-700/50 pb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-indigo-400" /> Location
                  </h3>
                  <p className="text-slate-300 text-sm">{complaint.address}</p>
                </div>
              )}
            </div>
          </div>

          {complaint.imageUrl && (
            <div className="glass-panel overflow-hidden">
              <div className="p-4 border-b border-slate-700/50">
                <h3 className="text-sm font-semibold text-white">Attached Evidence</h3>
              </div>
              <img
                src={`http://localhost:5000/${complaint.imageUrl.replace('\\', '/')}`}
                alt="Complaint evidence"
                className="w-full h-auto object-cover max-h-96"
              />
            </div>
          )}
        </div>

        {/* Right Column - Timeline */}
        <div className="md:w-80 lg:w-96">
          <div className="glass-panel p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-white mb-6 border-b border-slate-700/50 pb-4">Status Timeline</h3>
            
            <div className="relative border-l border-slate-700/50 ml-4 space-y-8">
              {complaint.statusHistory?.map((history, index) => {
                const isLatest = index === 0;
                
                return (
                  <div key={history.id} className="relative pl-6">
                    {/* Timeline dot */}
                    <div className={`absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-slate-900 ${
                      isLatest ? "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "bg-slate-500"
                    }`} />
                    
                    <div className="flex flex-col gap-1">
                      <span className={`text-sm font-bold ${isLatest ? "text-indigo-400" : "text-slate-300"}`}>
                        {history.status.replace("_", " ")}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {new Date(history.changedAt).toLocaleString()}
                      </span>
                      {history.note && (
                        <div className="mt-2 text-sm text-slate-400 bg-slate-800/50 p-3 rounded-md border border-slate-700/50">
                          {history.note}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Initial submission entry */}
              <div className="relative pl-6">
                <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-500" />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-slate-300">SUBMITTED</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <CheckCircle className="h-3 w-3" />
                    {new Date(complaint.createdAt).toLocaleString()}
                  </span>
                  <div className="mt-2 text-sm text-slate-400 bg-slate-800/50 p-3 rounded-md border border-slate-700/50">
                    Complaint received by system
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
