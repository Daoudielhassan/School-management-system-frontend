/**
 * Departments API layer — thin wrappers over the shared HTTP client.
 */
import { apiGet, apiPost, apiPut, apiDelete, API_ENDPOINTS } from '@/config/api';
import type { Department, DepartmentClass, DepartmentMutationPayload } from '../types';

function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object' && Array.isArray((value as any).content)) {
    return (value as any).content as T[];
  }
  return [];
}

export async function fetchDepartments(token?: string): Promise<Department[]> {
  return toArray<Department>(await apiGet(API_ENDPOINTS.DEPARTMENTS.BASE, token));
}

export async function fetchClassesByDepartment(
  departmentId: string,
  token?: string
): Promise<DepartmentClass[]> {
  return toArray<DepartmentClass>(
    await apiGet(API_ENDPOINTS.CLASSES.BY_DEPARTMENT(departmentId), token)
  );
}

export function createDepartment(
  payload: DepartmentMutationPayload,
  token?: string
): Promise<Department> {
  return apiPost<Department>(API_ENDPOINTS.DEPARTMENTS.BASE, payload, token);
}

export function updateDepartment(
  id: string,
  payload: DepartmentMutationPayload,
  token?: string
): Promise<Department> {
  return apiPut<Department>(API_ENDPOINTS.DEPARTMENTS.BY_ID(id), payload, token);
}

export function deleteDepartment(id: string, token?: string): Promise<void> {
  return apiDelete<void>(API_ENDPOINTS.DEPARTMENTS.BY_ID(id), token);
}
