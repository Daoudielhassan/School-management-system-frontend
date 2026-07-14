/**
 * Profile API layer — `/api/students/me`, `/api/students/{id}`, `/api/auth/change-password`.
 * Thin, framework-agnostic wrappers over the shared HTTP client; hooks add
 * React Query, auth and cache invalidation.
 */
import { apiGet, apiPost, apiPut, API_ENDPOINTS } from '@/config/api';
import type { StudentProfile, StudentProfileUpdatePayload, ChangePasswordPayload } from '../types';

/** `GET /api/students/me` — the id is resolved server-side from the JWT. */
export function fetchMyProfile(token?: string): Promise<StudentProfile> {
  return apiGet<StudentProfile>(API_ENDPOINTS.STUDENTS.ME, token);
}

/**
 * `PUT /api/students/{id}` — there is no write `/me` route, so `id` must be
 * the caller's own id, resolved beforehand via {@link fetchMyProfile}.
 */
export function updateMyProfile(
  id: string,
  payload: StudentProfileUpdatePayload,
  token?: string
): Promise<StudentProfile> {
  return apiPut<StudentProfile>(API_ENDPOINTS.STUDENTS.BY_ID(id), payload, token);
}

/** `POST /api/auth/change-password`. */
export function changeMyPassword(payload: ChangePasswordPayload, token?: string): Promise<void> {
  return apiPost<void>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, payload, token);
}
