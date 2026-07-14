/**
 * Permissions API layer.
 *
 * TODO(backend): no permissions/RBAC-management endpoint exists anywhere in
 * the current backend contract (see ADMIN_BACKEND_TODO.md) — role
 * authorization is hardcoded gateway/service-side, not data-driven. Replace
 * this body with a real call once such an endpoint exists.
 */
import type { Permission } from '../types';

export function fetchPermissions(): Promise<Permission[]> {
  return Promise.resolve([]);
}
