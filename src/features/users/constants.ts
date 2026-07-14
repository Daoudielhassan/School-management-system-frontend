/**
 * Static configuration for the users feature.
 */

/** Root cache key for the users list. Kept as `['users']` for cache continuity. */
export const USERS_QUERY_KEY = ['users'] as const;

export const USERS_PAGE_SIZE = 10;

/** Roles supported by the identity service. */
export const USER_ROLES = ['ADMIN', 'MANAGER', 'INSTRUCTOR', 'STUDENT'] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Sentinel meaning "no role filter". */
export const ROLE_FILTER_ALL = 'all';
export type RoleFilter = UserRole | typeof ROLE_FILTER_ALL;

/** Human-readable label for a role. */
export function formatRole(role: string): string {
  switch (role) {
    case 'STUDENT':
      return 'Student';
    case 'INSTRUCTOR':
      return 'Instructor';
    case 'MANAGER':
      return 'Manager';
    case 'ADMIN':
      return 'Admin';
    default:
      return role;
  }
}
