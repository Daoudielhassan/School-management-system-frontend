/**
 * Grades API layer — `/api/grades`. The `instructorId` filter is honored as
 * literal on read, but the backend forces it to the caller's own id for
 * ROLE_INSTRUCTOR; writes are verified server-side against the instructor's
 * own active teaching assignments (`InstructorAccessGuard`).
 */
import { apiGet, apiPost, apiPut, apiDelete, API_ENDPOINTS } from '@/config/api';
import type { Grade, GradeMutationPayload } from '../types';

/** `GET /api/grades?instructorId=` — "my entered grades". */
export function fetchMyGrades(instructorId: string, token?: string): Promise<Grade[]> {
  return apiGet<Grade[]>(API_ENDPOINTS.GRADES.FILTER({ instructorId }), token);
}

/** `POST /api/grades`. */
export function createGrade(payload: GradeMutationPayload, token?: string): Promise<Grade> {
  return apiPost<Grade>(API_ENDPOINTS.GRADES.BASE, payload, token);
}

/** `PUT /api/grades/{id}`. */
export function updateGrade(id: string, payload: GradeMutationPayload, token?: string): Promise<Grade> {
  return apiPut<Grade>(API_ENDPOINTS.GRADES.BY_ID(id), payload, token);
}

/** `DELETE /api/grades/{id}`. */
export function deleteGrade(id: string, token?: string): Promise<void> {
  return apiDelete<void>(API_ENDPOINTS.GRADES.BY_ID(id), token);
}
