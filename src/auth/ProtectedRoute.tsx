import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { RefreshCw } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] text-slate-100 flex flex-col items-center justify-center space-y-4 font-mono">
        <RefreshCw className="w-8 h-8 animate-spin text-cyber-cyan text-glow-cyan" />
        <p className="text-xs tracking-wider">SECURE_GATEWAY_CREDENTIALS_RECOVERY_IN_PROGRESS...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
