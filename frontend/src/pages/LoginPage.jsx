// Implements login form with validation, React Query mutation, and role-aware redirects.
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useLogin } from "../hooks/useAuth";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required")
});

export default function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" }
  });

  const onSubmit = async (values) => {
    try {
      const data = await loginMutation.mutateAsync(values);
      toast.success("Logged in successfully");
      if (data.user.role === "ADMIN") navigate("/admin");
      else if (data.user.role === "OFFICER") navigate("/officer");
      else navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="glass-panel mx-auto mt-10 max-w-md p-8">
      <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back</h1>
      <p className="mt-2 text-sm text-slate-400">Sign in to continue managing civic complaints.</p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="text-sm font-medium text-slate-300">Email</label>
          <input
            type="email"
            className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-200 outline-none transition focus:border-indigo-500 focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500"
            placeholder="you@example.com"
            {...register("email")}
          />
          {errors.email ? <p className="mt-1 text-sm text-red-400">{errors.email.message}</p> : null}
        </div>
        <div>
          <label className="text-sm font-medium text-slate-300">Password</label>
          <input
            type="password"
            className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-200 outline-none transition focus:border-indigo-500 focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500"
            placeholder="••••••••"
            {...register("password")}
          />
          {errors.password ? (
            <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="mt-2 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {loginMutation.isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Need an account?{" "}
        <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
          Register
        </Link>
      </p>
    </div>
  );
}
