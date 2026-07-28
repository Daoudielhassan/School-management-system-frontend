/**
 * Users API layer — thin wrappers over the shared HTTP client.
 */
import { apiGet, apiPost, apiPut, apiDelete, API_ENDPOINTS } from '@/config/api';
import type { UserData, UserStats, CreateUserPayload, UpdateUserPayload } from '../types';

/** Fetch all users, tolerating both array and Spring `{ content: [...] }` shapes. */
export async function fetchUsers(token?: string): Promise<UserData[]> {
  const data = await apiGet<UserData[] | { content?: UserData[] }>(
    API_ENDPOINTS.USERS.BASE,
    token
  );
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.content) ? data.content : [];
}

/** Fetch aggregate user statistics. */
export function fetchUserStats(token?: string): Promise<UserStats> {
  return apiGet<UserStats>(API_ENDPOINTS.USERS.STATS, token);
}

export function createUser(payload: CreateUserPayload, token?: string): Promise<UserData> {
  return apiPost<UserData>(API_ENDPOINTS.USERS.BASE, payload, token);
}

export function updateUser(
  id: string,
  payload: UpdateUserPayload,
  token?: string
): Promise<UserData> {
  return apiPut<UserData>(API_ENDPOINTS.USERS.BY_ID(id), payload, token);
}

export function deleteUser(id: string, token?: string): Promise<void> {
  return apiDelete<void>(API_ENDPOINTS.USERS.BY_ID(id), token);
}

export function toggleUser(id: string, enable: boolean, token?: string): Promise<void> {
  const url = enable ? API_ENDPOINTS.USERS.ENABLE(id) : API_ENDPOINTS.USERS.DISABLE(id);
  return apiPut<void>(url, {}, token);
}

/** Resets any user's password to a freshly generated one-time value — works for every role, not just instructors. */
export function resetUserPassword(id: string, newPassword: string, token?: string): Promise<void> {
  return apiPut<void>(API_ENDPOINTS.USERS.CHANGE_PASSWORD(id, newPassword), {}, token);
}
