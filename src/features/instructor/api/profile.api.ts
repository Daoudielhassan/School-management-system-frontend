/**
 * Profile API layer — `/api/instructors/me`, `/api/instructors/{id}`, `/api/auth/change-password`.
 */
import { apiGet, apiPost, apiPut, API_ENDPOINTS } from '@/config/api';
import type { InstructorProfile, InstructorProfileUpdatePayload, ChangePasswordPayload } from '../types';

/** `GET /api/instructors/me` — resolved server-side from the JWT. */
export function fetchMyInstructorProfile(token?: string): Promise<InstructorProfile> {
  return apiGet<InstructorProfile>(API_ENDPOINTS.INSTRUCTORS.ME, token);
}

/** `PUT /api/instructors/{id}` — `id` must be the caller's own id, resolved via {@link fetchMyInstructorProfile}. */
export function updateMyInstructorProfile(
  id: string,
  payload: InstructorProfileUpdatePayload,
  token?: string
): Promise<InstructorProfile> {
  return apiPut<InstructorProfile>(API_ENDPOINTS.INSTRUCTORS.BY_ID(id), payload, token);
}

/** `POST /api/auth/change-password`. */
export function changeMyPassword(payload: ChangePasswordPayload, token?: string): Promise<void> {
  return apiPost<void>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, payload, token);
}
