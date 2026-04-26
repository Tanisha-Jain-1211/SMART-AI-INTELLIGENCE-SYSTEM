// Implements registration form with validation and auto-login behavior.
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../services/api";
import useAuthStore from "../store/authStore";

const schema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password")
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match"
  });

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (values) => {
    try {
      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined
      };
      const res = await api.post("/auth/register", payload);
      const { accessToken, user } = res.data.data;
      setToken(accessToken);
      setUser(user);
      toast.success("Account created");
      navigate("/");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="mx-auto max-w-md glass-panel p-8 mt-10 mb-10">
      <h1 className="text-3xl font-bold text-white tracking-tight">Create an Account</h1>
      <p className="text-slate-400 mt-2 text-sm">Join the Smart Complaint Intelligence System.</p>
      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="text-sm font-medium text-slate-300">Full Name</label>
          <input
            className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500 transition-all"
            {...register("name")}
            placeholder="John Doe"
          />
          {errors.name ? (
            <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
          ) : null}
        </div>
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
          <label className="text-sm font-medium text-slate-300">
            Phone Number (optional)
          </label>
          <input
            className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500 transition-all"
            {...register("phone")}
            placeholder="+1 234 567 8900"
          />
          {errors.phone ? (
            <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
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
        <div>
          <label className="text-sm font-medium text-slate-300">
            Confirm Password
          </label>
          <input
            type="password"
            className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500 transition-all"
            {...register("confirmPassword")}
            placeholder="••••••••"
          />
          {errors.confirmPassword ? (
            <p className="mt-1 text-sm text-red-400">
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:bg-indigo-500 disabled:opacity-60 transition-all"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
