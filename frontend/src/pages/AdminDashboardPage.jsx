// Admin console shell with responsive sidebar navigation across operational modules.
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Map,
  TrendingUp,
  Users,
  Building2,
  Menu,
  X
} from "lucide-react";

import AdminOverview from "../components/admin/AdminOverview";
import AdminComplaints from "../components/admin/AdminComplaints";
import AdminHeatmap from "../components/admin/AdminHeatmap";
import AdminTrends from "../components/admin/AdminTrends";
import AdminUsers from "../components/admin/AdminUsers";
import AdminDepartments from "../components/admin/AdminDepartments";

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "complaints", label: "Complaints", icon: FileText },
  { id: "heatmap", label: "Heatmap", icon: Map },
  { id: "trends", label: "Trends", icon: TrendingUp },
  { id: "users", label: "Users", icon: Users },
  { id: "departments", label: "Departments", icon: Building2 }
];

export default function AdminDashboardPage() {
  const [tab, setTab] = useState("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const content = () => {
    switch (tab) {
      case "overview":
        return <AdminOverview />;
      case "complaints":
        return <AdminComplaints />;
      case "heatmap":
        return <AdminHeatmap />;
      case "trends":
        return <AdminTrends />;
      case "users":
        return <AdminUsers />;
      case "departments":
        return <AdminDepartments />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-120px)] gap-6">
      {/* Mobile toggle */}
      <button
        type="button"
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg lg:hidden"
        onClick={() => setMobileNavOpen((o) => !o)}
        aria-label="Toggle navigation"
      >
        {mobileNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform border-r border-slate-800 bg-slate-950/95 p-4 pt-24 transition-transform lg:static lg:z-0 lg:translate-x-0 lg:border-r lg:bg-transparent lg:p-0 lg:pt-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <nav className="space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id);
                  setMobileNavOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <section className="min-w-0 flex-1">{content()}</section>
    </div>
  );
}
