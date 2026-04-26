import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import toast from "react-hot-toast";
import { UploadCloud, MapPin, Send } from "lucide-react";

import api from "../services/api";

const schema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.enum(["ELECTRICITY", "WATER", "ROADS", "GARBAGE", "STREET_LIGHTS", "EDUCATION", "PUBLIC_SAFETY", "OTHER"]).optional(),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  address: z.string().optional()
});

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    }
  });
  return position === null ? null : <Marker position={position}></Marker>;
}

export default function SubmitComplaintPage() {
  const navigate = useNavigate();
  const [position, setPosition] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      category: "OTHER",
      urgency: "MEDIUM"
    }
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("category", values.category);
      formData.append("urgency", values.urgency);
      if (values.address) formData.append("address", values.address);
      if (position) {
        formData.append("latitude", position.lat.toString());
        formData.append("longitude", position.lng.toString());
      }
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await api.post("/complaints", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      toast.success("Complaint submitted successfully!");
      navigate("/my-complaints");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit complaint");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Report an Issue</h1>
        <p className="text-slate-400 mt-2">Provide details about the issue so we can fix it as soon as possible.</p>
      </div>

      <div className="glass-panel p-6 sm:p-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Info */}
          <div className="space-y-5 border-b border-slate-700/50 pb-8">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">1</span>
              Issue Details
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Issue Title</label>
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="e.g., Massive pothole on Main Street"
                {...register("title")}
              />
              {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
                <select
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500 transition-all"
                  {...register("category")}
                >
                  <option value="ELECTRICITY">Electricity</option>
                  <option value="WATER">Water</option>
                  <option value="ROADS">Roads</option>
                  <option value="GARBAGE">Garbage</option>
                  <option value="STREET_LIGHTS">Street Lights</option>
                  <option value="EDUCATION">Education</option>
                  <option value="PUBLIC_SAFETY">Public Safety</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Urgency</label>
                <select
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500 transition-all"
                  {...register("urgency")}
                >
                  <option value="LOW">Low - Routine</option>
                  <option value="MEDIUM">Medium - Needs attention</option>
                  <option value="HIGH">High - Urgent</option>
                  <option value="CRITICAL">Critical - Immediate danger</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Detailed Description</label>
              <textarea
                rows={4}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                placeholder="Describe the issue in detail..."
                {...register("description")}
              />
              {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-5 border-b border-slate-700/50 pb-8">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">2</span>
              Location
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Street Address or Landmark</label>
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="e.g., Near City Hall Park"
                {...register("address")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5 flex justify-between items-center">
                <span>Pinpoint on Map</span>
                <span className="text-xs text-slate-400 font-normal">Click on the map to place a pin</span>
              </label>
              <div className="h-[300px] rounded-lg overflow-hidden border border-slate-700 z-10 relative">
                <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  />
                  <LocationPicker position={position} setPosition={setPosition} />
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="space-y-5 pb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">3</span>
              Evidence
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Upload a Photo</label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-600 px-6 py-10 hover:bg-slate-800/30 transition-colors">
                <div className="text-center">
                  {imagePreview ? (
                    <div className="mb-4">
                      <img src={imagePreview} alt="Preview" className="mx-auto h-32 w-auto rounded-lg object-cover" />
                    </div>
                  ) : (
                    <UploadCloud className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  )}
                  <div className="mt-4 flex text-sm leading-6 text-slate-400 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-transparent font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 text-slate-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:bg-indigo-500 disabled:opacity-60 transition-all"
            >
              {isSubmitting ? "Submitting..." : "Submit Complaint"}
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
