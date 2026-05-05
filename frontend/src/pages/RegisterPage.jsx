// Implements registration form with validation and React Query-powered signup.
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useRegister } from "../hooks/useAuth";

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
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors }
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
      await registerMutation.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined
      });
      toast.success("Account created");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="glass-panel mx-auto mt-10 max-w-md p-8">
      <h1 className="text-3xl font-bold tracking-tight text-white">Create account</h1>
      <p className="mt-2 text-sm text-slate-400">Citizen accounts unlock submissions and tracking.</p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="text-sm font-medium text-slate-300">Name</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            {...register("name")}
          />
          {errors.name ? <p className="mt-1 text-sm text-red-400">{errors.name.message}</p> : null}
        </div>
        <div>
          <label className="text-sm font-medium text-slate-300">Email</label>
          <input
            type="email"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            {...register("email")}
          />
          {errors.email ? <p className="mt-1 text-sm text-red-400">{errors.email.message}</p> : null}
        </div>
        <div>
          <label className="text-sm font-medium text-slate-300">Phone (optional)</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            {...register("phone")}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-300">Password</label>
          <input
            type="password"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            {...register("password")}
          />
          {errors.password ? (
            <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
          ) : null}
        </div>
        <div>
          <label className="text-sm font-medium text-slate-300">Confirm password</label>
          <input
            type="password"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword ? (
            <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="mt-2 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {registerMutation.isPending ? "Creating…" : "Register"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already registered?{" "}
        <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
          Login
        </Link>
      </p>
    </div>
  );
}
