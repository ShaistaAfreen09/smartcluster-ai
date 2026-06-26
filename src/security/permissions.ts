import { UserRole, ROLE_DEFINITIONS } from "./roles";

export type PermissionAction = 
  | "VIEW_METRICS" 
  | "MANAGE_CLUSTERS" 
  | "MANAGE_AI_POLICIES";

export const hasPermission = (role: UserRole | string, action: PermissionAction): boolean => {
  const normalizedRole = (role || "Viewer") as UserRole;
  const def = ROLE_DEFINITIONS[normalizedRole];
  
  if (!def) return false;
  
  switch (action) {
    case "VIEW_METRICS":
      return def.canViewMetrics;
    case "MANAGE_CLUSTERS":
      return def.canManageConfig;
    case "MANAGE_AI_POLICIES":
      return def.canManageAiPolicies;
    default:
      return false;
  }
};
