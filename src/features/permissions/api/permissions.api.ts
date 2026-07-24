/**
 * Permissions API layer — thin wrapper over the shared HTTP client.
 */
import { apiGet, API_ENDPOINTS } from '@/config/api';
import type { Permission } from '../types';

export function fetchPermissions(token?: string): Promise<Permission[]> {
  return apiGet<Permission[]>(API_ENDPOINTS.PERMISSIONS.BASE, token);
}
