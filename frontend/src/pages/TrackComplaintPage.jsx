// Detailed complaint tracker with media, maps, AI insights, and history timeline.
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle,
  Share2
} from "lucide-react";
import toast from "react-hot-toast";

import CategoryBadge from "../components/badges/CategoryBadge";
import StatusBadge from "../components/badges/StatusBadge";
import UrgencyBadge from "../components/badges/UrgencyBadge";
import ErrorMessage from "../components/ui/ErrorMessage";
import { useComplaint } from "../hooks/useComplaints";
import { complaintImageUrl } from "../utils/complaintImageUrl";

export default function TrackComplaintPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const query = useComplaint(id);

  const share = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  if (query.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-indigo-400">
        <Loader2 className="mb-4 h-10 w-10 animate-spin" />
        <p>Loading complaint details...</p>
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <ErrorMessage
          title="Complaint not found"
          message="We couldn't load this complaint. It may have been removed."
        />
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Go back
        </button>
      </div>
    );
  }

  const complaint = query.data;
  const imgSrc = complaintImageUrl(complaint.imageUrl);
  const confidencePct =
    typeof complaint.aiConfidence === "number" ? Math.round(complaint.aiConfidence * 100) : null;

  return (
    <div className="mx-auto max-w-5xl py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={share}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-white hover:border-indigo-500"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-6">
          <div className="glass-panel p-6 sm:p-8">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-2xl font-bold leading-tight text-white">{complaint.title}</h1>
              <StatusBadge status={complaint.status} />
            </div>
            <div className="mb-6 flex flex-wrap gap-2">
              <CategoryBadge category={complaint.category} />
              <UrgencyBadge urgency={complaint.urgency} />
            </div>

            {(complaint.aiCategory || complaint.aiUrgency || confidencePct !== null) && (
              <div className="mb-6 rounded-xl border border-indigo-500/25 bg-indigo-500/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">AI insight</p>
                <p className="mt-2 text-sm text-slate-200">
                  Model suggests{" "}
                  <span className="font-semibold text-white">{complaint.aiCategory || complaint.category}</span> ·{" "}
                  <span className="font-semibold text-white">{complaint.aiUrgency || complaint.urgency}</span>
                </p>
                {confidencePct !== null ? (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Confidence</span>
                      <span>{confidencePct}%</span>
                    </div>
                    <progress
                      className="mt-1 h-2 w-full accent-indigo-500"
                      value={Math.min(100, confidencePct)}
                      max={100}
                    />
                  </div>
                ) : null}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 border-b border-slate-800 pb-2 text-sm font-semibold text-white">
                  Description
                </h3>
                <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </div>
              {complaint.address ? (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 border-b border-slate-800 pb-2 text-sm font-semibold text-white">
                    <MapPin className="h-4 w-4 text-indigo-400" /> Address
                  </h3>
                  <p className="text-sm text-slate-300">{complaint.address}</p>
                </div>
              ) : null}
            </div>
          </div>

          {complaint.imageUrl ? (
            <div className="glass-panel overflow-hidden">
              <div className="border-b border-slate-800 p-4">
                <h3 className="text-sm font-semibold text-white">Evidence</h3>
              </div>
              <img src={imgSrc} alt="Complaint evidence" className="max-h-96 w-full object-cover" />
            </div>
          ) : null}

          {complaint.latitude != null && complaint.longitude != null ? (
            <div className="glass-panel p-4">
              <h3 className="mb-3 text-sm font-semibold text-white">Pinned location</h3>
              <div className="h-56 overflow-hidden rounded-xl border border-slate-800">
                <MapContainer
                  center={[complaint.latitude, complaint.longitude]}
                  zoom={15}
                  className="h-full w-full"
                  scrollWheelZoom={false}
                >
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                  <Marker position={[complaint.latitude, complaint.longitude]}>
                    <Popup>Reported location</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          ) : null}
        </div>

        <div className="w-full lg:w-96">
          <div className="glass-panel sticky top-24 p-6">
            <h3 className="mb-6 border-b border-slate-800 pb-4 text-lg font-semibold text-white">
              Status timeline
            </h3>
            <div className="relative ml-4 space-y-8 border-l border-slate-800 pl-6">
              {complaint.statusHistory?.map((history, index) => {
                const isLatest = index === 0;
                return (
                  <div key={history.id} className="relative">
                    <div
                      className={`absolute -left-[29px] top-1.5 h-3 w-3 rounded-full border-2 border-slate-950 ${
                        isLatest ? "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "bg-slate-500"
                      }`}
                    />
                    <div className="flex flex-col gap-1">
                      <span className={`text-sm font-bold ${isLatest ? "text-indigo-300" : "text-slate-300"}`}>
                        {history.status.replace(/_/g, " ")}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        {new Date(history.changedAt).toLocaleString()}
                      </span>
                      {history.note ? (
                        <div className="mt-2 rounded-md border border-slate-800 bg-slate-900/60 p-3 text-sm text-slate-400">
                          {history.note}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
              <div className="relative">
                <div className="absolute -left-[29px] top-1.5 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-500" />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-slate-300">Submitted</span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <CheckCircle className="h-3 w-3" />
                    {new Date(complaint.createdAt).toLocaleString()}
                  </span>
                  <div className="mt-2 rounded-md border border-slate-800 bg-slate-900/60 p-3 text-sm text-slate-400">
                    Received from citizen portal
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
