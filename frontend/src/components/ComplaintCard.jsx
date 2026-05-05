// Summary card for complaint previews with media, badges, and navigation.
import { Link } from "react-router-dom";
import { MapPin, AlertCircle, Calendar } from "lucide-react";

import CategoryBadge from "./badges/CategoryBadge";
import StatusBadge from "./badges/StatusBadge";
import UrgencyBadge from "./badges/UrgencyBadge";
import { complaintImageUrl } from "../utils/complaintImageUrl";

export default function ComplaintCard({ complaint }) {
  const img = complaintImageUrl(complaint.imageUrl);

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden">
      {complaint.imageUrl ? (
        <div className="h-48 w-full overflow-hidden bg-slate-800">
          <img
            src={img}
            alt={complaint.title}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/400x200/1e293b/94a3b8?text=No+Image";
            }}
          />
        </div>
      ) : (
        <div className="h-48 w-full bg-slate-800/50 flex items-center justify-center border-b border-slate-700/50">
          <AlertCircle className="h-12 w-12 text-slate-600" />
        </div>
      )}
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
          <StatusBadge status={complaint.status} />
          <div className="flex flex-wrap gap-2">
            <CategoryBadge category={complaint.category} />
            <UrgencyBadge urgency={complaint.urgency} />
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{complaint.title}</h3>
        <p className="text-sm text-slate-400 mb-4 line-clamp-3 flex-grow">{complaint.description}</p>
        
        <div className="space-y-2 mt-auto pt-4 border-t border-slate-700/50">
          {complaint.address && (
            <div className="flex items-center text-xs text-slate-400">
              <MapPin className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
              <span className="truncate">{complaint.address}</span>
            </div>
          )}
          <div className="flex items-center text-xs text-slate-400">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
            <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <Link
          to={`/track/${complaint.id}`}
          className="mt-4 block w-full text-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 hover:text-indigo-300 transition-colors border border-slate-700"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
