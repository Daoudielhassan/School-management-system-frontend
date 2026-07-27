/**
 * Discipline API layer.
 */
import { apiGet, apiPost, apiPut, apiDelete, API_ENDPOINTS } from '@/config/api';
import { DISCIPLINE_PAGE_SIZE, STATUS_FILTER_ALL, SEVERITY_FILTER_ALL, ACADEMIC_YEAR_FILTER_ALL } from '../constants';
import type {
  DisciplinePage,
  DisciplineStats,
  DisciplineFilters,
  CreateCasePayload,
  UpdateCasePayload,
  DisciplinaryCase,
} from '../types';

export async function fetchCases(
  filters: DisciplineFilters,
  page: number,
  token?: string
): Promise<DisciplinePage> {
  const params = new URLSearchParams({ page: String(page), size: String(DISCIPLINE_PAGE_SIZE) });
  if (filters.status !== STATUS_FILTER_ALL) params.set('status', filters.status);
  if (filters.severity !== SEVERITY_FILTER_ALL) params.set('severity', filters.severity);
  if (filters.academicYearId !== ACADEMIC_YEAR_FILTER_ALL) params.set('academicYearId', filters.academicYearId);

  const data = await apiGet<any>(`${API_ENDPOINTS.DISCIPLINE.BASE}?${params}`, token);
  if (data?.content) {
    return { content: data.content, totalPages: data.totalPages ?? 1, number: data.number ?? page };
  }
  return { content: Array.isArray(data) ? data : [], totalPages: 1, number: 0 };
}

export function fetchDisciplineStats(token?: string): Promise<DisciplineStats> {
  return apiGet<DisciplineStats>(API_ENDPOINTS.DISCIPLINE.STATS, token);
}

export function createCase(payload: CreateCasePayload, token?: string): Promise<DisciplinaryCase> {
  return apiPost<DisciplinaryCase>(API_ENDPOINTS.DISCIPLINE.BASE, payload, token);
}

export function updateCase(
  id: string,
  payload: UpdateCasePayload,
  token?: string
): Promise<DisciplinaryCase> {
  return apiPut<DisciplinaryCase>(API_ENDPOINTS.DISCIPLINE.BY_ID(id), payload, token);
}

export function deleteCase(id: string, token?: string): Promise<void> {
  return apiDelete<void>(API_ENDPOINTS.DISCIPLINE.BY_ID(id), token);
}
