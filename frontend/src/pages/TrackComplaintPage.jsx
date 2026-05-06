// Detailed complaint tracker with progress pipeline, AI insights, media, and maps.
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import {
  ArrowLeft,
  Loader2,
  Clock,
  MapPin,
  Share2
} from "lucide-react";
import toast from "react-hot-toast";

import CategoryBadge from "../components/badges/CategoryBadge";
import StatusBadge from "../components/badges/StatusBadge";
import UrgencyBadge from "../components/badges/UrgencyBadge";
import ErrorMessage from "../components/ui/ErrorMessage";
import { useComplaint } from "../hooks/useComplaints";
import { complaintImageUrl } from "../utils/complaintImageUrl";
import {
  buildPipelineSteps,
  getLastUpdatedAt,
  getProgressPercent,
  getUrgencyEtaNote,
  formatStepLabel
} from "../utils/complaintProgress";

function formatTrackDate(value) {
  try {
    if (!value) return null;
    return new Date(value).toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  } catch (err) {
    console.log("[TrackComplaintPage] formatTrackDate", err);
    return null;
  }
}

function StepCircle({ visual }) {
  try {
    if (visual === "completed") {
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-900/40">
          ✓
        </div>
      );
    }
    if (visual === "current") {
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-lg shadow-blue-900/40 animate-pulse ring-4 ring-blue-500/35">
          ●
        </div>
      );
    }
    if (visual === "rejected") {
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-lg shadow-red-900/40 animate-pulse ring-4 ring-red-500/35">
          !
        </div>
      );
    }
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-slate-600 bg-slate-950/80 text-[10px] font-semibold text-slate-600">
        ○
      </div>
    );
  } catch (err) {
    console.log("[TrackComplaintPage] StepCircle", err);
    return <div className="h-10 w-10 shrink-0 rounded-full border-2 border-slate-600 bg-slate-950" />;
  }
}

export default function TrackComplaintPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const query = useComplaint(id);

  const share = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch (err) {
      console.log("[TrackComplaintPage] share", err);
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

  const steps = buildPipelineSteps(complaint, complaint.statusHistory);
  const progress = getProgressPercent(complaint.status);
  const lastUpdated = getLastUpdatedAt(complaint, complaint.statusHistory);
  const etaNote = getUrgencyEtaNote(complaint.urgency);
  const rejectedStep = steps.find((s) => s.visual === "rejected");
  const isRejected = complaint.status === "REJECTED";

  const lineClassBetween = (idx) => {
    try {
      const thisStep = steps[idx];
      const nextStep = steps[idx + 1];
      if (!nextStep) return "";
      if (isRejected && nextStep.visual === "rejected") return "bg-red-600/80";
      if (thisStep.visual === "completed") return "bg-emerald-600";
      return "bg-slate-700";
    } catch (err) {
      console.log("[TrackComplaintPage] lineClassBetween", err);
      return "bg-slate-700";
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
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

      {/* Status summary + progress */}
      <div className="mb-6 space-y-4">
        <div
          className={`glass-panel p-5 sm:p-6 ${isRejected ? "border-red-500/30 bg-red-950/20" : ""}`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Current status
                </span>
                <StatusBadge status={complaint.status} />
              </div>
              <p className="text-lg font-semibold text-white">
                Your complaint is currently:{" "}
                <span className={isRejected ? "text-red-300" : "text-indigo-200"}>
                  {formatStepLabel(complaint.status).toUpperCase()}
                </span>
              </p>
              <p className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                <Clock className="h-4 w-4 shrink-0 text-slate-500" />
                Last updated:{" "}
                <span className="text-slate-200">{formatTrackDate(lastUpdated) || "—"}</span>
              </p>
              <p className="text-sm text-slate-300">{etaNote}</p>
              {isRejected ? (
                <div className="rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-100">
                  <p className="font-semibold text-red-200">Your complaint was not accepted.</p>
                  {rejectedStep?.note ? (
                    <p className="mt-2 text-red-100/90 whitespace-pre-wrap">Officer note: {rejectedStep.note}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Resolution progress
              </span>
              {progress.variant === "rejected" ? (
                <span className="text-sm font-bold text-red-400">Rejected</span>
              ) : (
                <span className="text-sm font-bold text-indigo-200">{progress.percent}%</span>
              )}
            </div>
            <div
              className={`relative h-3 w-full overflow-hidden rounded-full bg-slate-800 ${
                progress.variant === "rejected" ? "ring-1 ring-red-500/40" : ""
              }`}
            >
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  progress.variant === "rejected" ? "bg-red-600" : "bg-gradient-to-r from-indigo-600 to-emerald-500"
                }`}
                style={{
                  width: progress.variant === "rejected" ? "100%" : `${progress.percent}%`
                }}
              />
              {progress.variant === "normal" ? (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow">
                  {progress.percent}%
                </span>
              ) : (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow">
                  Rejected
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Progress stepper */}
        <div className="min-w-0 flex-1">
          <div className={`glass-panel p-5 sm:p-6 ${isRejected ? "border-red-500/25" : ""}`}>
            <h2 className="mb-6 border-b border-slate-800 pb-3 text-lg font-semibold text-white">
              Resolution roadmap
            </h2>
            <div className="space-y-0">
              {steps.map((step, idx) => (
                <div key={step.status} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <StepCircle visual={step.visual} />
                    {idx < steps.length - 1 ? (
                      <div className={`my-1 w-0.5 min-h-[32px] shrink-0 ${lineClassBetween(idx)}`} />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 pb-8 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-bold uppercase tracking-wide ${
                          step.visual === "completed"
                            ? "text-emerald-300"
                            : step.visual === "current"
                              ? "text-blue-300"
                              : step.visual === "rejected"
                                ? "text-red-300"
                                : "text-slate-500"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {step.changedAt ? (
                      <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        {formatTrackDate(step.changedAt)}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-slate-600">Not reached yet</p>
                    )}
                    {step.note ? (
                      <div className="mt-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-300 whitespace-pre-wrap">
                        {step.note}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-6 lg:max-w-xl">
          <div className="glass-panel p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">AI result</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <CategoryBadge category={complaint.aiCategory || complaint.category} />
              <UrgencyBadge urgency={complaint.aiUrgency || complaint.urgency} />
            </div>
            <p className="mt-3 text-sm text-slate-200">
              Model suggests{" "}
              <span className="font-semibold text-white">{complaint.aiCategory || complaint.category}</span> ·{" "}
              <span className="font-semibold text-white">{complaint.aiUrgency || complaint.urgency}</span>
            </p>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Confidence score</span>
                <span>{confidencePct !== null ? `${confidencePct}%` : "—"}</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500 ease-out"
                  style={{ width: `${confidencePct !== null ? Math.min(100, confidencePct) : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 sm:p-8">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-2xl font-bold leading-tight text-white">{complaint.title}</h1>
              <StatusBadge status={complaint.status} />
            </div>
            <div className="mb-6 flex flex-wrap gap-2">
              <CategoryBadge category={complaint.category} />
              <UrgencyBadge urgency={complaint.urgency} />
            </div>

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
      </div>
    </div>
  );
}
