// Implements login form with validation, API call, and auth state updates.
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../services/api";
import useAuthStore from "../store/authStore";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required")
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" }
  });

  const onSubmit = async (values) => {
    try {
      const res = await api.post("/auth/login", values);
      const { accessToken, user } = res.data.data;
      setToken(accessToken);
      setUser(user);
      toast.success("Logged in successfully");

      if (user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="mx-auto max-w-md glass-panel p-8 mt-10">
      <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
      <p className="text-slate-400 mt-2 text-sm">Sign in to your account to continue.</p>
      
      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="text-sm font-medium text-slate-300">Email Address</label>
          <input
            type="email"
            className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500 transition-all"
            {...register("email")}
            placeholder="you@example.com"
          />
          {errors.email ? (
            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
          ) : null}
        </div>
        <div>
          <label className="text-sm font-medium text-slate-300">Password</label>
          <input
            type="password"
            className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500 transition-all"
            {...register("password")}
            placeholder="••••••••"
          />
          {errors.password ? (
            <p className="mt-1 text-sm text-red-400">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:bg-indigo-500 disabled:opacity-60 transition-all"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
          Create one now
        </Link>
      </p>
    </div>
  );
}
