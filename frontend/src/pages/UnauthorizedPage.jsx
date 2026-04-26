// Shows an authorization error when user lacks permissions.
import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8">
      <h1 className="text-2xl font-bold text-slate-900">Unauthorized</h1>
      <p className="mt-2 text-slate-600">
        You don’t have permission to view this page.
      </p>
      <Link
        to="/"
        className="mt-5 inline-flex rounded bg-slate-900 px-4 py-2 text-white"
      >
        Go Home
      </Link>
    </div>
  );
}

