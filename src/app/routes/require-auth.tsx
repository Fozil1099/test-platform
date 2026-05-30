import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth";

export function RequireAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
