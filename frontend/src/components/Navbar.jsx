// Primary navigation with responsive layout, auth-aware links, and dropdown actions.
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { LayoutDashboard, FileText, UserCircle, LogOut, Menu, X } from "lucide-react";

import api from "../services/api";
import useAuthStore from "../store/authStore";

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logoutStore = useAuthStore((state) => state.logout);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-indigo-500/20 text-indigo-300"
        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
    }`;

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore network failures — still clear client session */
    }
    logoutStore();
    setMobileOpen(false);
  };

  const links = (
    <>
      <NavLink to="/" end className={navLinkClass} onClick={() => setMobileOpen(false)}>
        Home
      </NavLink>
      {user ? (
        <NavLink to="/dashboard" className={navLinkClass} onClick={() => setMobileOpen(false)}>
          Dashboard
        </NavLink>
      ) : null}
      <NavLink to="/submit" className={navLinkClass} onClick={() => setMobileOpen(false)}>
        Submit
      </NavLink>
      {user ? (
        <NavLink to="/my-complaints" className={navLinkClass} onClick={() => setMobileOpen(false)}>
          My complaints
        </NavLink>
      ) : null}
      {user?.role === "ADMIN" ? (
        <NavLink to="/admin" className={navLinkClass} onClick={() => setMobileOpen(false)}>
          <LayoutDashboard className="h-4 w-4" />
          Admin
        </NavLink>
      ) : null}
      {user?.role === "OFFICER" ? (
        <NavLink to="/officer" className={navLinkClass} onClick={() => setMobileOpen(false)}>
          <LayoutDashboard className="h-4 w-4" />
          Officer
        </NavLink>
      ) : null}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm text-white shadow-lg shadow-indigo-600/40">
            SC
          </span>
          <span className="hidden sm:inline">Smart Complaints</span>
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">{links}</div>

        <div className="ml-auto flex items-center gap-3">
          {!user ? (
            <>
              <Link
                to="/login"
                className="hidden text-sm font-medium text-slate-300 hover:text-white sm:inline"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="hidden rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 sm:inline"
              >
                Register
              </Link>
            </>
          ) : (
            <details className="relative hidden sm:block">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:border-indigo-500/50">
                <UserCircle className="h-5 w-5 text-indigo-400" />
                {user.name?.split(" ")[0] || "Account"}
              </summary>
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-950 p-2 shadow-xl">
                <p className="border-b border-slate-800 px-3 py-2 text-xs text-slate-500">
                  Signed in as
                  <span className="mt-1 block text-sm font-medium text-slate-200">{user.email}</span>
                </p>
                <Link
                  to="/my-complaints"
                  className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-900"
                >
                  <FileText className="h-4 w-4" />
                  My complaints
                </Link>
                {user.role === "ADMIN" ? (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-900"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Admin console
                  </Link>
                ) : null}
                {user.role === "OFFICER" ? (
                  <Link
                    to="/officer"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-900"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Officer console
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </details>
          )}

          <button
            type="button"
            className="inline-flex rounded-lg border border-slate-700 p-2 text-slate-200 lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-800 bg-slate-950 px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-1">{links}</div>
          {!user ? (
            <div className="mt-4 flex flex-col gap-2 border-t border-slate-800 pt-4">
              <Link
                to="/login"
                className="rounded-lg border border-slate-700 py-2 text-center text-sm font-medium text-white"
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-indigo-600 py-2 text-center text-sm font-semibold text-white"
                onClick={() => setMobileOpen(false)}
              >
                Register
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 w-full rounded-lg border border-red-500/40 py-2 text-sm font-semibold text-red-300"
            >
              Logout
            </button>
          )}
        </div>
      ) : null}
    </nav>
  );
}
