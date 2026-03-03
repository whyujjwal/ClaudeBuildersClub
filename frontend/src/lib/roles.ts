export type UserRole = "admin" | "project_manager" | "user"

const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  project_manager: 1,
  admin: 2,
}

export function hasMinimumRole(
  userRole: UserRole | undefined,
  requiredRole: UserRole
): boolean {
  if (!userRole) return false
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export const ROLE_LABELS: Record<UserRole, string> = {
  user: "User",
  project_manager: "Project Manager",
  admin: "Admin",
}
