// Bootstraps the React app with router and React Query providers.
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import App from "./App";
import "./index.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png?url";
import iconShadowUrl from "leaflet/dist/images/marker-shadow.png?url";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl,
  shadowUrl: iconShadowUrl
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000
    }
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          success: { style: { background: "#052e16", color: "#bbf7d0" } },
          error: { style: { background: "#450a0a", color: "#fecaca" } },
          loading: { style: { background: "#172554", color: "#bfdbfe" } }
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);
