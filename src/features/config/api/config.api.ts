/**
 * System config API layer — thin wrappers over the shared HTTP client.
 */
import { apiGet, apiPut, API_ENDPOINTS } from '@/config/api';
import type { SystemConfig } from '../types';

export function fetchConfigs(token?: string): Promise<SystemConfig[]> {
  return apiGet<SystemConfig[]>(API_ENDPOINTS.SYSTEM_CONFIG.BASE, token);
}

export function updateConfig(key: string, value: string, token?: string): Promise<SystemConfig> {
  return apiPut<SystemConfig>(API_ENDPOINTS.SYSTEM_CONFIG.BY_KEY(key), { value }, token);
}
