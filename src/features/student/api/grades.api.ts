/**
 * Grades API layer — `/api/grades/me`, `/api/reports/grades/me`.
 */
import { apiGet, API_ENDPOINTS } from '@/config/api';
import type { GradeResponse, GradeSummary } from '../types';

/** `GET /api/grades/me` — teacher comments are already included, no extra call needed. */
export function fetchMyGrades(token?: string): Promise<GradeResponse[]> {
  return apiGet<GradeResponse[]>(API_ENDPOINTS.GRADES.ME, token);
}

/** `GET /api/reports/grades/me` — computed average/min/max, used by the dashboard. */
export function fetchMyGradeSummary(token?: string): Promise<GradeSummary> {
  return apiGet<GradeSummary>(API_ENDPOINTS.REPORTS.GRADES_ME, token);
}
