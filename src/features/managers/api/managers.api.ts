/**
 * Managers API layer — thin, framework-agnostic wrappers over the shared HTTP
 * client. No React, no cache logic here: functions take a `token` and return
 * promises. Hooks (in ../hooks) add React Query, auth and cache invalidation.
 */
import { apiGet, apiPost, apiPut, apiPatch, apiDelete, API_ENDPOINTS } from '@/config/api';
import type {
  ManagerData,
  CreateManagerResponse,
  ManagerCreatePayload,
  ManagerUpdatePayload,
  ManagerStatus,
  Department,
} from '../types';

/**
 * `GET /api/managers/active` — there is no plain "list all managers" endpoint
 * in the backend contract, so the active roster is the closest bulk read
 * available. Managers that are ON_LEAVE/SUSPENDED/TERMINATED won't show up
 * here; use `GET /api/managers/search` or `/employee/{employeeNumber}` to
 * find a specific one outside this list.
 */
export function fetchManagers(token?: string): Promise<ManagerData[]> {
  return apiGet<ManagerData[]>(API_ENDPOINTS.MANAGERS.ACTIVE, token);
}

/** Fetch departments for the create-form selector and the department filter. */
export function fetchManagerDepartments(token?: string): Promise<Department[]> {
  return apiGet<Department[]>(API_ENDPOINTS.DEPARTMENTS.BASE, token);
}

/** `POST /api/managers`. The response carries a one-time `temporaryPassword`. */
export function createManager(
  payload: ManagerCreatePayload,
  token?: string
): Promise<CreateManagerResponse> {
  return apiPost<CreateManagerResponse>(API_ENDPOINTS.MANAGERS.BASE, payload, token);
}

/** `PUT /api/managers/{id}`. */
export function updateManager(
  id: string,
  payload: ManagerUpdatePayload,
  token?: string
): Promise<ManagerData> {
  return apiPut<ManagerData>(API_ENDPOINTS.MANAGERS.BY_ID(id), payload, token);
}

/** `DELETE /api/managers/{id}` — 204, no body. */
export function deleteManager(id: string, token?: string): Promise<void> {
  return apiDelete<void>(API_ENDPOINTS.MANAGERS.BY_ID(id), token);
}

/** `PATCH /api/managers/{id}/status?status=` — query param, no body. */
export function updateManagerStatus(
  id: string,
  status: ManagerStatus,
  token?: string
): Promise<ManagerData> {
  return apiPatch<ManagerData>(API_ENDPOINTS.MANAGERS.UPDATE_STATUS(id, status), {}, token);
}
