/**
 * Teaching modules API layer — thin wrappers over the shared HTTP client.
 */
import { apiGet, apiPost, apiPut, apiDelete, API_ENDPOINTS } from '@/config/api';
import type { TeachingModule, ModuleMutationPayload } from '../types';

function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object' && Array.isArray((value as any).content)) {
    return (value as any).content as T[];
  }
  return [];
}

export async function fetchModules(token?: string): Promise<TeachingModule[]> {
  return toArray<TeachingModule>(await apiGet(API_ENDPOINTS.MODULES.BASE, token));
}

export function createModule(payload: ModuleMutationPayload, token?: string): Promise<TeachingModule> {
  return apiPost<TeachingModule>(API_ENDPOINTS.MODULES.BASE, payload, token);
}

export function updateModule(
  id: string,
  payload: ModuleMutationPayload,
  token?: string
): Promise<TeachingModule> {
  return apiPut<TeachingModule>(API_ENDPOINTS.MODULES.BY_ID(id), payload, token);
}

export function deleteModule(id: string, token?: string): Promise<void> {
  return apiDelete<void>(API_ENDPOINTS.MODULES.BY_ID(id), token);
}
