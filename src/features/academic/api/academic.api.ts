/**
 * Academic-years API layer.
 */
import { apiGet, apiPost, apiPut, API_ENDPOINTS } from '@/config/api';
import type { AcademicYear, CreateAcademicYearPayload } from '../types';

export async function fetchAcademicYears(token?: string): Promise<AcademicYear[]> {
  const data = await apiGet<AcademicYear[] | { content?: AcademicYear[] }>(
    API_ENDPOINTS.ACADEMIC_YEARS.BASE,
    token
  );
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.content) ? data.content : [];
}

export function createAcademicYear(
  payload: CreateAcademicYearPayload,
  token?: string
): Promise<AcademicYear> {
  return apiPost<AcademicYear>(API_ENDPOINTS.ACADEMIC_YEARS.BASE, payload, token);
}

export function setActiveAcademicYear(id: string, token?: string): Promise<unknown> {
  return apiPut(`${API_ENDPOINTS.ACADEMIC_YEARS.BY_ID(id)}/activate`, {}, token);
}
