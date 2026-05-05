// Guided multi-step complaint submission with map pinning and ML feedback.
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import toast from "react-hot-toast";
import { ChevronRight, ChevronLeft, UploadCloud, Sparkles } from "lucide-react";

import { useCreateComplaint } from "../hooks/useComplaints";
import { createUploadProgressHandler } from "../hooks/useFileUpload";

const GURUGRAM = [28.4595, 77.0266];

const schema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.enum([
    "ELECTRICITY",
    "WATER",
    "ROADS",
    "GARBAGE",
    "STREET_LIGHTS",
    "EDUCATION",
    "PUBLIC_SAFETY",
    "OTHER"
  ]),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  address: z.string().optional()
});

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    }
  });
  return position === null ? null : <Marker position={position} />;
}

export default function SubmitComplaintPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [position, setPosition] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadPct, setUploadPct] = useState(0);
  const [aiSummary, setAiSummary] = useState(null);
  const redirectTimer = useRef(null);

  const createComplaint = useCreateComplaint();

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      category: "OTHER",
      urgency: "MEDIUM",
      title: "",
      description: "",
      address: ""
    }
  });

  const acceptFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5MB or smaller");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const nextFromStep1 = async () => {
    const ok = await trigger(["title", "description", "category", "urgency"]);
    if (ok) setStep(2);
  };

  const nextFromStep2 = async () => {
    const ok = await trigger(["address"]);
    if (ok) setStep(3);
  };

  const buildFormData = () => {
    const values = getValues();
    const fd = new FormData();
    fd.append("title", values.title);
    fd.append("description", values.description);
    fd.append("category", values.category);
    fd.append("urgency", values.urgency);
    if (values.address) fd.append("address", values.address);
    if (position) {
      fd.append("latitude", String(position.lat));
      fd.append("longitude", String(position.lng));
    }
    if (imageFile) fd.append("image", imageFile);
    return fd;
  };

  const onFinalSubmit = async () => {
    try {
      setUploadPct(0);
      const res = await createComplaint.mutateAsync({
        formData: buildFormData(),
        onProgress: createUploadProgressHandler(setUploadPct)
      });
      const complaint = res.data.data;
      setAiSummary({
        category: complaint.aiCategory || complaint.category,
        urgency: complaint.aiUrgency || complaint.urgency,
        confidence: complaint.aiConfidence,
        duplicate: complaint.isDuplicate
      });
      toast.success("Complaint submitted");
      redirectTimer.current = window.setTimeout(() => {
        navigate(`/track/${complaint.id}`);
      }, 3000);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Submission failed");
    }
  };

  const values = getValues();

  return (
    <div className="mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Report an issue</h1>
        <p className="mt-2 text-slate-400">Step {step} of 3 · AI enrichment runs automatically after submit.</p>
        <div className="mt-4 flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full ${step >= s ? "bg-indigo-500" : "bg-slate-800"}`}
            />
          ))}
        </div>
      </div>

      <div className="glass-panel p-6 sm:p-10">
        {step === 1 ? (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-white">Issue details</h2>
            <div>
              <label className="text-sm text-slate-300">Title</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-200"
                {...register("title")}
              />
              {errors.title ? <p className="mt-1 text-sm text-red-400">{errors.title.message}</p> : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-slate-300">Category</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-200"
                  {...register("category")}
                >
                  <option value="ELECTRICITY">Electricity</option>
                  <option value="WATER">Water</option>
                  <option value="ROADS">Roads</option>
                  <option value="GARBAGE">Garbage</option>
                  <option value="STREET_LIGHTS">Street lights</option>
                  <option value="EDUCATION">Education</option>
                  <option value="PUBLIC_SAFETY">Public safety</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-300">Your urgency estimate</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-200"
                  {...register("urgency")}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-300">Description</label>
              <textarea
                rows={5}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-200"
                {...register("description")}
              />
              {errors.description ? (
                <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
              ) : null}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={nextFromStep1}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-white">Location</h2>
            <div>
              <label className="text-sm text-slate-300">Address / landmark</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-200"
                placeholder="e.g. Sector 29 market road"
                {...register("address")}
              />
            </div>
            <div className="h-[320px] overflow-hidden rounded-xl border border-slate-800">
              <MapContainer center={GURUGRAM} zoom={13} className="h-full w-full" scrollWheelZoom>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                <LocationPicker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>
            <p className="text-xs text-slate-500">Click the map to drop a pin. Coordinates sync automatically.</p>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                onClick={nextFromStep2}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Evidence & review</h2>
            <div
              className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-10 text-center"
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                acceptFile(e.dataTransfer.files?.[0]);
              }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="" className="mx-auto max-h-40 rounded-lg object-contain" />
              ) : (
                <UploadCloud className="mx-auto mb-3 h-12 w-12 text-slate-500" />
              )}
              <label className="mt-3 cursor-pointer text-sm font-semibold text-indigo-400">
                Upload photo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => acceptFile(e.target.files?.[0])}
                />
              </label>
              <p className="mt-2 text-xs text-slate-500">JPEG / PNG / WebP · max 5MB</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">Summary</p>
              <p className="mt-2 font-medium text-indigo-200">{values.title}</p>
              <p className="mt-1 line-clamp-4 text-slate-400">{values.description}</p>
              <p className="mt-3 text-xs text-slate-500">
                {values.category} · {values.urgency}{" "}
                {position ? ` · ${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}` : ""}
              </p>
            </div>

            {createComplaint.isPending ? (
              <p className="text-sm text-indigo-300">Uploading… {uploadPct}%</p>
            ) : null}

            {aiSummary ? (
              <div className="flex gap-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-sm text-indigo-100">
                <Sparkles className="h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold text-white">AI detected</p>
                  <p className="mt-1">
                    Category → {aiSummary.category} · Urgency → {aiSummary.urgency}
                    {typeof aiSummary.confidence === "number"
                      ? ` · Confidence → ${Math.round(aiSummary.confidence * 100)}%`
                      : ""}
                  </p>
                  {aiSummary.duplicate ? (
                    <p className="mt-2 text-xs text-amber-200">Flagged as potential duplicate — officers will review.</p>
                  ) : null}
                  <p className="mt-2 text-xs text-indigo-200/80">Redirecting to tracking page…</p>
                </div>
              </div>
            ) : null}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                disabled={createComplaint.isPending}
                onClick={() => handleSubmit(onFinalSubmit)()}
                className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {createComplaint.isPending ? "Submitting…" : "Submit complaint"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
