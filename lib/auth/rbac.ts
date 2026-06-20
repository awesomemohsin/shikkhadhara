export enum Role {
  OWNER = 'owner',
  SUPER_ADMIN = 'super_admin',
  INSTITUTION_ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
  GUARDIAN = 'parent',
  STAFF = 'staff',
}

// Map roles to numeric priority weights
const roleWeights: Record<string, number> = {
  [Role.STUDENT]: 10,
  [Role.GUARDIAN]: 10,
  [Role.TEACHER]: 20,
  [Role.STAFF]: 20,
  [Role.INSTITUTION_ADMIN]: 30,
  [Role.SUPER_ADMIN]: 100,
  [Role.OWNER]: 1000,
};

/**
 * Checks if a user's role has equal or greater access weight than the required role.
 */
export function hasRoleOrAbove(userRole: string, requiredRole: Role): boolean {
  const userWeight = roleWeights[userRole] || 0;
  const requiredWeight = roleWeights[requiredRole] || 0;
  return userWeight >= requiredWeight;
}

/**
 * Guardrail check to verify user tenant matches the host header tenant.
 */
export function verifyTenantMatch(userTenantId: string, headerTenantId: string | null): boolean {
  if (!headerTenantId) return true; // Allow if header not resolved (e.g. dev default environment)
  return userTenantId.toString() === headerTenantId.toString();
}

/**
 * Validates both tenant isolation match and RBAC permissions.
 */
export function validateRequestAccess(
  userRole: string,
  userTenantId: string,
  requiredRole: Role,
  headerTenantId: string | null
): boolean {
  // If user is OWNER or SUPER_ADMIN, they bypass tenant boundaries for cross-tenant operations
  if (userRole === Role.OWNER || userRole === Role.SUPER_ADMIN) {
    return true;
  }

  // 1. Verify tenant isolation
  if (!verifyTenantMatch(userTenantId, headerTenantId)) {
    return false;
  }

  // 2. Verify role permissions
  return hasRoleOrAbove(userRole, requiredRole);
}
