/**
 * Profile API layer — `/api/managers/me`, `/api/managers/{id}`, `/api/auth/change-password`.
 */
import { apiGet, apiPatch, apiPost, apiPut, API_ENDPOINTS } from '@/config/api';
import type { ManagerProfile, ManagerProfileUpdatePayload, ManagerStatus, ChangePasswordPayload } from '../types';

/** `GET /api/managers/me` — resolved server-side from the JWT. */
export function fetchMyManagerProfile(token?: string): Promise<ManagerProfile> {
  return apiGet<ManagerProfile>(API_ENDPOINTS.MANAGERS.ME, token);
}

/** `PUT /api/managers/{id}` — `id` must be the caller's own id, resolved via {@link fetchMyManagerProfile}. */
export function updateMyManagerProfile(
  id: string,
  payload: ManagerProfileUpdatePayload,
  token?: string
): Promise<ManagerProfile> {
  return apiPut<ManagerProfile>(API_ENDPOINTS.MANAGERS.BY_ID(id), payload, token);
}

/**
 * `PATCH /api/managers/{id}/status?status=` — query param, no body. Not
 * exposed as self-service in this portal (a manager shouldn't set their own
 * status to e.g. `SUSPENDED`); kept here for admin-side management.
 */
export function updateManagerStatus(id: string, status: ManagerStatus, token?: string): Promise<ManagerProfile> {
  return apiPatch<ManagerProfile>(API_ENDPOINTS.MANAGERS.UPDATE_STATUS(id, status), {}, token);
}

/** `POST /api/auth/change-password`. */
export function changeMyPassword(payload: ChangePasswordPayload, token?: string): Promise<void> {
  return apiPost<void>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, payload, token);
}
