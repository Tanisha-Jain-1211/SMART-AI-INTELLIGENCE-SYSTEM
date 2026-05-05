// Application routing with lazy-loaded screens and role-aware guards.
import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/ui/LoadingSpinner";

const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const CitizenDashboardPage = lazy(() => import("./pages/CitizenDashboardPage"));
const SubmitComplaintPage = lazy(() => import("./pages/SubmitComplaintPage"));
const TrackComplaintPage = lazy(() => import("./pages/TrackComplaintPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const OfficerDashboardPage = lazy(() => import("./pages/OfficerDashboardPage"));
const UnauthorizedPage = lazy(() => import("./pages/UnauthorizedPage"));
const MyComplaintsPage = lazy(() => import("./pages/MyComplaintsPage"));

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <Suspense fallback={<LoadingSpinner label="Loading screen…" />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <CitizenDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/submit"
              element={
                <ProtectedRoute>
                  <SubmitComplaintPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-complaints"
              element={
                <ProtectedRoute>
                  <MyComplaintsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/track/:id"
              element={
                <ProtectedRoute>
                  <TrackComplaintPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="ADMIN">
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/officer"
              element={
                <ProtectedRoute role="OFFICER">
                  <OfficerDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Chatbot />
    </div>
  );
}
