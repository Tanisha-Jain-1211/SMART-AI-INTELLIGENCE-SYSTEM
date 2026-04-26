import { Link, NavLink } from "react-router-dom";
import { LayoutDashboard, FileText, UserCircle, LogOut } from "lucide-react";
import useAuthStore from "../store/authStore";

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
      isActive
        ? "bg-indigo-500/20 text-indigo-400 neon-border"
        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
    }`;

  return (
    <nav className="sticky top-0 z-50 glass-panel rounded-none border-t-0 border-x-0 border-slate-700/50">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] group-hover:scale-105 transition-transform">
            <span className="text-white">SC</span>
          </div>
          <span className="text-glow hidden sm:block">Smart Complaints</span>
        </Link>
        
        <div className="hidden items-center gap-2 sm:flex">
          <NavLink to="/submit" className={navLinkClass}>
            Submit
          </NavLink>
          {user && (
            <NavLink to="/my-complaints" className={navLinkClass}>
              My Complaints
            </NavLink>
          )}
          {user?.role === "ADMIN" && (
            <NavLink to="/admin" className={navLinkClass}>
              <LayoutDashboard className="h-4 w-4" />
              Admin
            </NavLink>
          )}
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          {!user ? (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Login
              </Link>
              <Link to="/register" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all">
                Register
              </Link>
            </>
          ) : (
            <details className="relative group">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full glass-panel px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/60 transition-colors">
                <UserCircle className="h-5 w-5 text-indigo-400" />
                {user.name?.split(" ")[0] || "Account"}
              </summary>
              <div className="absolute right-0 z-20 mt-3 w-56 glass-panel p-2">
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Signed in as<br/>
                  <span className="text-slate-300 text-sm normal-case">{user.email}</span>
                </div>
                <hr className="my-1 border-slate-700/50" />
                <Link
                  to="/my-complaints"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  My Complaints
                </Link>
                {user.role === "ADMIN" && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Admin Dashboard
                  </Link>
                )}
                <hr className="my-1 border-slate-700/50" />
                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </details>
          )}
        </div>
      </div>
    </nav>
  );
}
