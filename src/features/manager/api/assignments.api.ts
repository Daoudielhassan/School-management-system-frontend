/**
 * Read-only API layer for the manager's own assignments/responsibilities/
 * actions — informational widgets, not editable by the manager themselves
 * (admin-configured).
 */
import { apiGet, API_ENDPOINTS } from '@/config/api';
import type { ManagerAssignment, ManagerResponsibility, ManagerAction } from '../types';

/** `GET /api/manager-assignments/manager/{managerId}/active`. */
export function fetchMyActiveAssignments(managerId: string, token?: string): Promise<ManagerAssignment[]> {
  return apiGet<ManagerAssignment[]>(API_ENDPOINTS.MANAGER_ASSIGNMENTS.BY_MANAGER_ACTIVE(managerId), token);
}

/** `GET /api/manager-responsibilities/manager/{managerId}`. */
export function fetchMyResponsibilities(managerId: string, token?: string): Promise<ManagerResponsibility[]> {
  return apiGet<ManagerResponsibility[]>(API_ENDPOINTS.MANAGER_RESPONSIBILITIES.BY_MANAGER(managerId), token);
}

/** `GET /api/manager-actions/manager/{managerId}/recent?limit=`. */
export function fetchMyRecentActions(managerId: string, limit = 10, token?: string): Promise<ManagerAction[]> {
  return apiGet<ManagerAction[]>(API_ENDPOINTS.MANAGER_ACTIONS.RECENT(managerId, limit), token);
}
