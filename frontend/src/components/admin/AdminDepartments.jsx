// Department registry with assignment workflow into operational teams.
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import ErrorMessage from "../ui/ErrorMessage";
import LoadingSpinner from "../ui/LoadingSpinner";
import { useAssignComplaintDepartment, useComplaints } from "../../hooks/useComplaints";
import { useCreateDepartment, useDepartments } from "../../hooks/useAdminStats";

const deptSchema = z.object({
  name: z.string().min(2),
  email: z.union([z.string().email(), z.literal("")]).optional()
});

export default function AdminDepartments() {
  const deptQuery = useDepartments();
  const createDept = useCreateDepartment();
  const assignMutation = useAssignComplaintDepartment();
  const complaintsQuery = useComplaints({ page: 1, limit: 100 });
  const [assignDept, setAssignDept] = useState(null);
  const [selectedComplaintId, setSelectedComplaintId] = useState("");
  const [search, setSearch] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(deptSchema),
    defaultValues: { name: "", email: "" }
  });

  const filteredComplaints = useMemo(() => {
    const rows = complaintsQuery.data?.data || [];
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((c) => c.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
  }, [complaintsQuery.data, search]);

  const onCreate = async (values) => {
    try {
      await createDept.mutateAsync({
        name: values.name,
        email: values.email || undefined
      });
      toast.success("Department created");
      reset();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Create failed");
    }
  };

  const submitAssign = async () => {
    if (!assignDept || !selectedComplaintId) return;
    try {
      await assignMutation.mutateAsync({
        id: selectedComplaintId,
        departmentId: assignDept.id
      });
      toast.success("Complaint assigned");
      setAssignDept(null);
      setSelectedComplaintId("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Assignment failed");
    }
  };

  if (deptQuery.isLoading) return <LoadingSpinner />;
  if (deptQuery.isError) return <ErrorMessage title="Departments unavailable" />;

  const departments = deptQuery.data || [];

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="glass-panel p-5">
        <h3 className="text-lg font-semibold text-white">Add department</h3>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit(onCreate)}>
          <div>
            <label className="text-xs text-slate-400">Name</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200"
              {...register("name")}
            />
            {errors.name ? <p className="mt-1 text-xs text-red-400">{errors.name.message}</p> : null}
          </div>
          <div>
            <label className="text-xs text-slate-400">Email (optional)</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200"
              {...register("email")}
            />
            {errors.email ? <p className="mt-1 text-xs text-red-400">{errors.email.message}</p> : null}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Create"}
          </button>
        </form>
      </div>

      <div className="glass-panel p-5">
        <h3 className="text-lg font-semibold text-white">Directory</h3>
        <div className="mt-4 space-y-3">
          {departments.map((d) => (
            <div
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3"
            >
              <div>
                <p className="font-semibold text-white">{d.name}</p>
                <p className="text-xs text-slate-500">{d.email || "No email"}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-indigo-200">
                  {d._count?.complaints ?? 0} complaints
                </span>
                <button
                  type="button"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  onClick={() => setAssignDept(d)}
                >
                  Assign complaint
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {assignDept ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 lg:col-span-2">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-950 p-6">
            <h3 className="text-lg font-semibold text-white">Assign to {assignDept.name}</h3>
            <input
              className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
              placeholder="Search complaints..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="mt-3 max-h-56 overflow-y-auto rounded-lg border border-slate-800">
              {filteredComplaints.map((c) => (
                <label
                  key={c.id}
                  className="flex cursor-pointer items-center gap-3 border-b border-slate-800 px-3 py-2 text-sm hover:bg-slate-900"
                >
                  <input
                    type="radio"
                    name="complaintPick"
                    checked={selectedComplaintId === c.id}
                    onChange={() => setSelectedComplaintId(c.id)}
                  />
                  <span className="text-slate-200 line-clamp-1">{c.title}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="text-sm text-slate-400" onClick={() => setAssignDept(null)}>
                Cancel
              </button>
              <button
                type="button"
                disabled={assignMutation.isPending || !selectedComplaintId}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                onClick={submitAssign}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
