/**
 * Subjects API layer — thin wrappers over the shared HTTP client.
 */
import { apiGet, apiPost, apiPut, apiDelete, API_ENDPOINTS } from '@/config/api';
import type { Subject, SubjectMutationPayload } from '../types';

function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object' && Array.isArray((value as any).content)) {
    return (value as any).content as T[];
  }
  return [];
}

export async function fetchSubjects(token?: string): Promise<Subject[]> {
  return toArray<Subject>(await apiGet(API_ENDPOINTS.SUBJECTS.BASE, token));
}

export function createSubject(payload: SubjectMutationPayload, token?: string): Promise<Subject> {
  return apiPost<Subject>(API_ENDPOINTS.SUBJECTS.BASE, payload, token);
}

export function updateSubject(
  id: string,
  payload: SubjectMutationPayload,
  token?: string
): Promise<Subject> {
  return apiPut<Subject>(API_ENDPOINTS.SUBJECTS.BY_ID(id), payload, token);
}

export function deleteSubject(id: string, token?: string): Promise<void> {
  return apiDelete<void>(API_ENDPOINTS.SUBJECTS.BY_ID(id), token);
}
