import React from "react";
import { useAuthStore } from "../stores/authStore";
import { PermissionAction, hasPermission } from "./permissions";
import { ShieldAlert, Lock } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredPermission: PermissionAction;
  fallback?: React.ReactNode;
}

export default function RoleGuard({ 
  children, 
  requiredPermission, 
  fallback 
}: RoleGuardProps) {
  const { user } = useAuthStore();
  const userRole = user?.workspaceRole || "Viewer";
  const permitted = hasPermission(userRole, requiredPermission);

  if (permitted) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Enterprise fallback panel for restricted features
  return (
    <div className="p-6 rounded-2xl border border-cyber-red/25 bg-cyber-red/5 text-center space-y-3 dark:shadow-[0_0_15px_rgba(239,68,68,0.05)]">
      <div className="w-10 h-10 rounded-xl bg-cyber-red/10 border border-cyber-red/20 flex items-center justify-center mx-auto">
        <Lock className="w-5 h-5 text-cyber-red animate-pulse" />
      </div>
      <div>
        <h4 className="text-xs font-mono font-extrabold uppercase tracking-widest text-cyber-red">
          Access Restricted: {requiredPermission} Required
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          Your current security clearance level (<b>{userRole}</b>) is insufficient to interact with this autonomic system controller. Contact your lead platform architect.
        </p>
      </div>
    </div>
  );
}
