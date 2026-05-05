// Interactive complaint density map with optional heat overlay.
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

import ErrorMessage from "../ui/ErrorMessage";
import LoadingSpinner from "../ui/LoadingSpinner";
import { useHeatmap } from "../../hooks/useAdminStats";

function urgencyFill(u) {
  switch (u) {
    case "CRITICAL":
      return "#ef4444";
    case "HIGH":
      return "#f97316";
    case "MEDIUM":
      return "#eab308";
    default:
      return "#22c55e";
  }
}

function HeatOverlay({ points, visible }) {
  const map = useMap();

  useEffect(() => {
    if (!visible || !points?.length) return undefined;
    const latlngs = points
      .filter((p) => p.latitude != null && p.longitude != null)
      .map((p) => [p.latitude, p.longitude, 0.5]);
    if (!latlngs.length) return undefined;
    const layer = L.heatLayer(latlngs, { radius: 32, blur: 22, maxZoom: 14 });
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map, points, visible]);

  return null;
}

export default function AdminHeatmap() {
  const [heatOn, setHeatOn] = useState(true);
  const query = useHeatmap();

  const center = useMemo(() => [28.4595, 77.0266], []);
  const points = query.data || [];

  if (query.isLoading) return <LoadingSpinner />;
  if (query.isError) return <ErrorMessage title="Heatmap unavailable" />;

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[420px] flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          Plotting {points.length} geotagged complaints — Gurugram viewport.
        </p>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={heatOn}
            onChange={(e) => setHeatOn(e.target.checked)}
            className="rounded border-slate-600 bg-slate-900"
          />
          Density heat overlay
        </label>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-800">
        <MapContainer center={center} zoom={12} className="h-full w-full" scrollWheelZoom>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <HeatOverlay points={points} visible={heatOn} />
          {points.map((p) =>
            p.latitude != null && p.longitude != null ? (
              <CircleMarker
                key={p.id}
                center={[p.latitude, p.longitude]}
                radius={8}
                pathOptions={{ color: urgencyFill(p.urgency), fillColor: urgencyFill(p.urgency), fillOpacity: 0.85 }}
              >
                <Popup>
                  <div className="text-xs text-slate-800">
                    <p className="font-semibold">{p.category}</p>
                    <p className="text-slate-600">{p.urgency}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ) : null
          )}
        </MapContainer>
      </div>
    </div>
  );
}
