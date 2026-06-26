export type UserRole = "Viewer" | "Operator" | "Admin";

export interface RolePermissions {
  role: UserRole;
  canViewMetrics: boolean;
  canManageConfig: boolean;
  canManageAiPolicies: boolean;
}

export const ROLE_DEFINITIONS: Record<UserRole, RolePermissions> = {
  Viewer: {
    role: "Viewer",
    canViewMetrics: true,
    canManageConfig: false,
    canManageAiPolicies: false,
  },
  Operator: {
    role: "Operator",
    canViewMetrics: true,
    canManageConfig: true,
    canManageAiPolicies: false,
  },
  Admin: {
    role: "Admin",
    canViewMetrics: true,
    canManageConfig: true,
    canManageAiPolicies: true,
  },
};
